import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security";
import type { SecurityEventType } from "@/lib/security";

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

  return NextResponse.json({ ok: true }, { status: 201 });
}
