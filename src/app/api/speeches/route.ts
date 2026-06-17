import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try { return NextResponse.json(await db.speeches.findMany()); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const item = await db.speeches.create({
      data: {
        name: data.name,
        title: data.title,
        badge: data.badge,
        photoUrl: data.photoUrl || "",
        welcomeSpeech: data.welcomeSpeech,
        order: data.order ?? 0
      }
    });
    return NextResponse.json(item);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
