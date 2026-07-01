import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const list = await db.gallery.findMany();
    return NextResponse.json(list);
  } catch {
    // Fallback to JSON db if Prisma table doesn't exist yet
    try {
      const list = await jsonDb.gallery.findMany();
      return NextResponse.json(list);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: "Judul dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    // imageUrl must already be a fully-formed URL supplied by the client
    // (uploaded via POST /api/upload → Supabase Storage public URL).
    const imageUrl: string = data.imageUrl || "";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Gambar wajib diunggah terlebih dahulu." },
        { status: 400 }
      );
    }

    const payload = {
      data: { title: data.title, category: data.category, imageUrl },
    };

    try {
      const item = await db.gallery.create(payload);
      return NextResponse.json(item, { status: 201 });
    } catch {
      // Prisma table not ready — fall back to JSON db
      const item = await jsonDb.gallery.create(payload);
      return NextResponse.json(item, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
