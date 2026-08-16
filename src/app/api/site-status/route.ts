import { NextRequest, NextResponse } from "next/server";
import { getSiteStatus, setSiteStatus } from "@/lib/siteStatus";
import { requireSuperadmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/site-status — public. Returns the current suspension flag.
 * Consumed by the middleware gate and the dashboard toggle. No auth so the
 * middleware (edge) can read it without a session.
 */
export async function GET() {
  const status = await getSiteStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * PUT /api/site-status — superadmin only. Toggles suspension / message / due date.
 */
export async function PUT(request: NextRequest) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({} as any));
  const patch: Partial<{ suspended: boolean; message: string; dueDate: string | null }> = {};

  if (typeof body.suspended === "boolean") patch.suspended = body.suspended;
  if (typeof body.message === "string") patch.message = body.message.slice(0, 500);
  if (body.dueDate === null) patch.dueDate = null;
  else if (typeof body.dueDate === "string") patch.dueDate = body.dueDate.slice(0, 10) || null;

  try {
    const status = await setSiteStatus(patch);
    return NextResponse.json(status);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Gagal memperbarui status situs" },
      { status: 500 }
    );
  }
}
