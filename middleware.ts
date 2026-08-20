import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Transparent "maintenance mode" gate.
 *
 * When the site is suspended (flag in `site_settings`, toggled from the
 * superadmin dashboard), public pages are redirected to an honest
 * `/maintenance` page. The dashboard and API stay open so a superadmin can
 * still log in with their normal credentials and switch it back on/off.
 *
 * A logged-in superadmin (valid `simad_auth` cookie) bypasses the curtain and
 * sees the live public site — this is the normal authenticated session, NOT a
 * hidden backdoor.
 */

const ROLES = ["superadmin", "admin_dinas", "admin_post"];

// Mirror the runtime secret resolution in src/lib/session.ts so dev & prod match.
function runtimeSecret(): string {
  const s = process.env.SIMAD_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : "simad-dev-secret-DO-NOT-USE-IN-PRODUCTION-xxxx";
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Edge-safe (Web Crypto) verification of the HMAC session cookie. Equivalent to
// verifySession() in src/lib/session.ts, which uses Node crypto.
async function verifySessionEdge(
  token: string | undefined
): Promise<{ id: string; role: string } | null> {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 4) return null;
  const [userId, role, expStr, sig] = parts;
  if (!ROLES.includes(role)) return null;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(runtimeSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${userId}|${role}|${expStr}`));
    const expected = toHex(mac);
    if (expected.length !== sig.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    return diff === 0 ? { id: userId, role } : null;
  } catch {
    return null;
  }
}

// Cache the suspension flag in-module (best-effort) to avoid fetching on every
// request. Fails open: if the flag can't be read, the site stays available.
const SUSPEND_TTL_MS = 30_000;
let cachedSuspended: boolean | null = null;
let cachedAt = 0;

async function isSuspended(request: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (cachedSuspended !== null && now - cachedAt < SUSPEND_TTL_MS) return cachedSuspended;
  try {
    const res = await fetch(new URL("/api/site-status", request.url), {
      headers: { "x-mw-probe": "1" },
    });
    if (!res.ok) return cachedSuspended ?? false;
    const data = await res.json();
    cachedSuspended = !!data.suspended;
    cachedAt = now;
    return cachedSuspended;
  } catch {
    return cachedSuspended ?? false;
  }
}

// Common scanner / exploit probe patterns. Matching one is a strong signal of an
// automated attack (recon for secrets, admin panels, known CMS vulns, traversal).
const SUSPICIOUS: { rule: string; re: RegExp }[] = [
  { rule: "dotenv-probe", re: /(^|\/)\.env(\.|$|\/)/i },
  { rule: "git-exposure", re: /(^|\/)\.git(\/|$)/i },
  { rule: "wordpress-probe", re: /wp-admin|wp-login|xmlrpc\.php|\/wp-content\//i },
  { rule: "phpmyadmin-probe", re: /phpmyadmin|\/pma\//i },
  { rule: "credential-file", re: /\/\.(aws|ssh|htpasswd)\b|\/(id_rsa|credentials)\b/i },
  { rule: "config-probe", re: /\/(config|configuration|settings)\.(php|json|ya?ml|xml|bak)\b/i },
  { rule: "php-shell", re: /\.php($|\?)|\/(shell|cmd|eval)\b/i },
  { rule: "path-traversal", re: /\.\.(%2f|%5c|\/|\\)/i },
  { rule: "sensitive-file", re: /\/etc\/passwd|\/proc\/self\//i },
  { rule: "sql-injection", re: /\bunion\s+select\b|\bor\s+1=1\b|sleep\(\d+\)/i },
];

function matchSuspicious(target: string): string | null {
  for (const { rule, re } of SUSPICIOUS) if (re.test(target)) return rule;
  return null;
}

// Report a suspicious request to the internal log endpoint (middleware runs on
// the edge and cannot write to Postgres directly). Best-effort; never blocks.
async function reportSuspicious(request: NextRequest, rule: string): Promise<void> {
  try {
    const h = request.headers;
    const decodeCity = (s: string | null) => {
      if (!s) return null;
      try { return decodeURIComponent(s); } catch { return s; }
    };
    const toNum = (s: string | null) => {
      const n = s ? parseFloat(s) : NaN;
      return Number.isFinite(n) ? n : null;
    };
    await fetch(new URL("/api/security/log", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sec-key": runtimeSecret() },
      body: JSON.stringify({
        type: "suspicious_request",
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null,
        country: h.get("x-vercel-ip-country"),
        region: h.get("x-vercel-ip-country-region"),
        city: decodeCity(h.get("x-vercel-ip-city")),
        lat: toNum(h.get("x-vercel-ip-latitude")),
        lng: toNum(h.get("x-vercel-ip-longitude")),
        path: request.nextUrl.pathname,
        method: request.method,
        userAgent: h.get("user-agent"),
        detail: rule,
      }),
    });
  } catch {
    // Ignore — logging must never break request handling.
  }
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Cache the IP blocklist in-module (best-effort) so we don't fetch it on every
// request. Fails open: if it can't be read, no one is blocked.
const BLOCK_TTL_MS = 30_000;
let cachedBlocked = new Set<string>();
let cachedBlockAt = 0;

async function blockedIps(request: NextRequest): Promise<Set<string>> {
  const now = Date.now();
  if (now - cachedBlockAt < BLOCK_TTL_MS) return cachedBlocked;
  cachedBlockAt = now;
  try {
    const res = await fetch(new URL("/api/security/block", request.url), {
      headers: { "x-sec-key": runtimeSecret() },
    });
    if (res.ok) {
      const data = await res.json();
      cachedBlocked = new Set(Array.isArray(data.ips) ? data.ips : []);
    }
  } catch {
    // keep the previous cache
  }
  return cachedBlocked;
}

// Friendly 403 page shown to a blocked visitor (edge middleware returns HTML
// directly — /logo.avif is excluded from the matcher so it still loads).
const BLOCKED_HTML = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Akses Dibatasi</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:linear-gradient(160deg,#f4f8f6,#e6efe9);color:#0f1c17}
.card{max-width:480px;width:100%;text-align:center;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:24px;padding:44px 32px;box-shadow:0 30px 60px -30px rgba(6,78,59,.35)}
img{width:56px;height:56px;object-fit:contain;margin:0 auto 18px;display:block}
.icon{width:72px;height:72px;margin:0 auto 22px;border-radius:20px;background:linear-gradient(135deg,#0E9F4F,#065f46);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 28px -14px rgba(14,159,79,.7)}
h1{font-size:1.5rem;font-weight:800;margin:0 0 12px;letter-spacing:-.02em}
p{font-size:.96rem;line-height:1.7;color:#556;margin:0 0 8px}
.tag{display:inline-flex;align-items:center;gap:8px;margin-top:20px;background:rgba(14,159,79,.1);border:1px solid rgba(14,159,79,.25);border-radius:99px;padding:8px 16px;font-size:.8rem;font-weight:700;color:#0E9F4F}
.dot{width:8px;height:8px;border-radius:50%;background:#0E9F4F;display:inline-block}
</style></head>
<body><div class="card">
<img src="/logo.avif" alt="">
<div class="icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
<h1>Akses Dibatasi</h1>
<p>Akses dari jaringan Anda untuk sementara dibatasi oleh pengelola situs.</p>
<p>Jika Anda merasa ini keliru, silakan hubungi pengelola DISPARPORA Lampung Timur.</p>
<div class="tag"><span class="dot"></span>DISPARPORA Lampung Timur</div>
</div></body></html>`;

function blockedResponse(): NextResponse {
  return new NextResponse(BLOCKED_HTML, {
    status: 403,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Never gate these: admin panel, APIs, the maintenance page itself, framework internals.
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/maintenance"
  ) {
    return res;
  }

  // Hard-block IPs on the blocklist (manual from dashboard, or auto).
  const ip = clientIp(request);
  if (ip !== "unknown" && (await blockedIps(request)).has(ip)) {
    return blockedResponse();
  }

  // Detect scanner/hacker probes → log, then block the request outright.
  const probe = matchSuspicious(pathname + request.nextUrl.search);
  if (probe) {
    await reportSuspicious(request, probe);
    return new NextResponse("Akses diblokir.", { status: 403 });
  }

  if (await isSuspended(request)) {
    const session = await verifySessionEdge(request.cookies.get("simad_auth")?.value);
    if (session?.role !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
