import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.events.findMany();
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    if (!data.title || !data.date || !data.location) {
      return NextResponse.json({ error: "Title, date, and location are required" }, { status: 400 });
    }
    const payload = {
      title: data.title,
      date: data.date,
      time: data.time || "",
      location: data.location,
      desc: data.desc || "",
      status: data.status || "Mendatang",
      image: data.image || "",
      guests: data.guests || "",
    };
    const item = await db.events.create({ data: payload });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
