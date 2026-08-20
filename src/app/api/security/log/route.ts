import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent, recentProbeCount, blockIp } from "@/lib/security";
import type { SecurityEventType } from "@/lib/security";

// Auto-block an IP after this many probes within the recent window.
const AUTO_BLOCK_THRESHOLD = 5;
const AUTO_BLOCK_MINUTES = 60;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/security/log — INTERNAL only.
 *
 * Called by the edge middleware (which cannot write to Postgres directly) to
 * record suspicious requests. Guarded by a shared internal key so the public
 * can't spam the log. The key never leaves the server (mirrors the runtime
 * secret in src/lib/session.ts), so clients cannot forge it.
 */
function internalKey(): string {
  const s = process.env.SIMAD_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : "simad-dev-secret-DO-NOT-USE-IN-PRODUCTION-xxxx";
}

const ALLOWED: SecurityEventType[] = [
  "login_failed",
  "login_rate_limited",
  "unauthorized",
  "suspicious_request",
];

export async function POST(request: NextRequest) {
  if (request.headers.get("x-sec-key") !== internalKey()) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({} as any));
  if (!ALLOWED.includes(body?.type)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  await logSecurityEvent({
    type: body.type,
    ip: body.ip,
    country: body.country,
    region: body.region,
    city: body.city,
    path: body.path,
    method: body.method,
    userAgent: body.userAgent,
    detail: body.detail,
    lat: body.lat,
    lng: body.lng,
  });

  // Auto-block IPs that keep probing.
  if (body.type === "suspicious_request" && typeof body.ip === "string" && body.ip) {
    const count = await recentProbeCount(body.ip, 10);
    if (count >= AUTO_BLOCK_THRESHOLD) {
      await blockIp(body.ip, `Auto-block: ${count} probe mencurigakan / 10 menit`, AUTO_BLOCK_MINUTES);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
