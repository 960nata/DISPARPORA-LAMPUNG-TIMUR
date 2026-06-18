import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    try { return NextResponse.json(await db.events.update({ where: { id }, data })); }
    catch { return NextResponse.json(await jsonDb.events.update({ where: { id }, data })); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try { return NextResponse.json(await db.events.delete({ where: { id } })); }
    catch { return NextResponse.json(await jsonDb.events.delete({ where: { id } })); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
