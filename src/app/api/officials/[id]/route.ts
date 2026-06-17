import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const item = await db.officials.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await db.officials.delete({ where: { id } });
    return NextResponse.json(item);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
