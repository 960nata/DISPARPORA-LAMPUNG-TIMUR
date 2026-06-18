import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();
    try { return NextResponse.json(await db.events.update({ where: { id }, data })); }
    catch { return NextResponse.json(await jsonDb.events.update({ where: { id }, data })); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    try { return NextResponse.json(await db.events.delete({ where: { id } })); }
    catch { return NextResponse.json(await jsonDb.events.delete({ where: { id } })); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
