import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/session";
import { getSecurityEvents, getSecuritySummary } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/security/events — superadmin only.
 * Returns recent security events + an aggregated summary for the dashboard.
 */
export async function GET(request: NextRequest) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 150);

  const [events, summary] = await Promise.all([
    getSecurityEvents(limit),
    getSecuritySummary(),
  ]);

  return NextResponse.json({ events, summary }, { headers: { "Cache-Control": "no-store" } });
}
