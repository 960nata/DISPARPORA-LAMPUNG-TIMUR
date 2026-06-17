import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function GET() {
  try { return NextResponse.json(await db.events.findMany()); }
  catch { return NextResponse.json(await jsonDb.events.findMany()); }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const payload = { data: { title: data.title, date: data.date, location: data.location, desc: data.desc, status: data.status, image: data.image || "" } };
    try { return NextResponse.json(await db.events.create(payload)); }
    catch { return NextResponse.json(await jsonDb.events.create(payload)); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
