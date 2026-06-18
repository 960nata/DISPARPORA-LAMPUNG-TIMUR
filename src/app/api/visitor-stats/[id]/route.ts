import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const data = await req.json();
  try {
    return NextResponse.json(await db.visitorStats.update({ where: { id }, data }));
  } catch {
    return NextResponse.json(await jsonDb.visitorStats.update({ where: { id }, data }));
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await db.visitorStats.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    await jsonDb.visitorStats.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
}
