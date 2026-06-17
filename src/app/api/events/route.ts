import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try { return NextResponse.json(await db.events.findMany()); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const item = await db.events.create({
      data: {
        title: data.title,
        date: data.date,
        location: data.location,
        desc: data.desc,
        status: data.status,
        image: data.image || ""
      }
    });
    return NextResponse.json(item);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
