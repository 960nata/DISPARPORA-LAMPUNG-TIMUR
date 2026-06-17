import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function GET() {
  try { return NextResponse.json(await db.officials.findMany()); }
  catch { return NextResponse.json(await jsonDb.officials.findMany()); }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const payload = { data: { name: data.name, title: data.title, role: data.role, photoUrl: data.photoUrl || "", order: data.order ?? 0 } };
    try { return NextResponse.json(await db.officials.create(payload)); }
    catch { return NextResponse.json(await jsonDb.officials.create(payload)); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
