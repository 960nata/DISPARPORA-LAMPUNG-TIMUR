import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try { return NextResponse.json(await db.events.findMany()); }
  catch { return NextResponse.json(await jsonDb.events.findMany()); }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    const payload = {
      title: data.title, date: data.date, time: data.time || "",
      location: data.location, desc: data.desc, status: data.status,
      image: data.image || "", guests: data.guests || "",
    };
    try { return NextResponse.json(await db.events.create({ data: payload }), { status: 201 }); }
    catch { return NextResponse.json(await jsonDb.events.create({ data: payload }), { status: 201 }); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
