import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(await db.visitorStats.findMany());
  } catch {
    return NextResponse.json(await jsonDb.visitorStats.findMany());
  }
}

export async function POST(req: NextRequest) {
  const { year, count } = await req.json();
  if (!year || count === undefined) {
    return NextResponse.json({ error: "year dan count wajib diisi" }, { status: 400 });
  }
  try {
    return NextResponse.json(await db.visitorStats.create({ data: { year, count } }), { status: 201 });
  } catch {
    return NextResponse.json(await jsonDb.visitorStats.create({ data: { year, count } }), { status: 201 });
  }
}
