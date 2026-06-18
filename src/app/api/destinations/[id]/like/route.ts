import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await jsonDb.destinations.incrementLikes({ where: { id } });
    return NextResponse.json({ id, likes: updated.likes ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
