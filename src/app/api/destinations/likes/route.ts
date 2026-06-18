import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/db";

export async function GET() {
  try {
    const map = await jsonDb.destinations.getLikesMap();
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return NextResponse.json({ map, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
