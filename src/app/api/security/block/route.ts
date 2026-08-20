import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/session";
import { blockIp, unblockIp, getBlockedIps, getActiveBlockedIpList } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Internal key shared with the edge middleware (mirrors src/lib/session.ts). */
function internalKey(): string {
  const s = process.env.SIMAD_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : "simad-dev-secret-DO-NOT-USE-IN-PRODUCTION-xxxx";
}
function isInternal(req: NextRequest): boolean {
  return req.headers.get("x-sec-key") === internalKey();
}

/**
 * GET /api/security/block
 * - internal (x-sec-key, from middleware) → { ips: [...] } active blocklist.
 * - superadmin → { blocked: [...] } full detail for the dashboard.
 */
export async function GET(request: NextRequest) {
  if (isInternal(request)) {
    return NextResponse.json({ ips: await getActiveBlockedIpList() }, { headers: { "Cache-Control": "no-store" } });
  }
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ blocked: await getBlockedIps() }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/security/block — block an IP.
 * Allowed for superadmin (manual, from dashboard) or internal (auto-block).
 * Body: { ip, reason?, minutes? }  (minutes omitted = permanent)
 */
export async function POST(request: NextRequest) {
  if (!isInternal(request)) {
    const auth = requireSuperadmin(request);
    if (auth instanceof NextResponse) return auth;
  }
  const body = await request.json().catch(() => ({} as any));
  const ip = typeof body.ip === "string" ? body.ip.trim() : "";
  if (!ip) return NextResponse.json({ error: "IP wajib diisi" }, { status: 400 });
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "Diblokir manual";
  const minutes = typeof body.minutes === "number" && body.minutes > 0 ? body.minutes : null;
  await blockIp(ip, reason, minutes);
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/security/block?ip=... — unblock (superadmin only).
 */
export async function DELETE(request: NextRequest) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;
  const ip = new URL(request.url).searchParams.get("ip") || "";
  if (!ip) return NextResponse.json({ error: "IP wajib diisi" }, { status: 400 });
  await unblockIp(ip);
  return NextResponse.json({ ok: true });
}
