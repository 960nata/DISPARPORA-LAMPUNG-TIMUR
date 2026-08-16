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
