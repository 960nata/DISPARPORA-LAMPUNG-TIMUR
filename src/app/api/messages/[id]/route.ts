import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

/**
 * PATCH /api/messages/[id] — update a message's status (admin only).
 * Body: { status: "read" | "unread" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();
    const status = data.status === "read" ? "read" : data.status === "unread" ? "unread" : undefined;
    if (!status) return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });

    const payload = { where: { id }, data: { status } };
    try {
      return NextResponse.json(await db.messages.update(payload));
    } catch {
      return NextResponse.json(await jsonDb.messages.update(payload));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * DELETE /api/messages/[id] — delete a message (admin only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    try {
      return NextResponse.json(await db.messages.delete({ where: { id } }));
    } catch {
      return NextResponse.json(await jsonDb.messages.delete({ where: { id } }));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
