import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { uniqueSlug } from "@/lib/slug";

export async function GET() {
  try {
    const list = await db.destinations.findMany();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(await jsonDb.destinations.findMany());
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    if (!data.name || !data.lat || !data.lng) {
      return NextResponse.json({ error: "Name and coordinates are required" }, { status: 400 });
    }

    // Auto-generate a slug from the name, unique against existing destinations
    // (adds -2, -3, … on collision). No manual slug entry needed.
    let existing: any[] = [];
    try { existing = await db.destinations.findMany(); } catch { existing = []; }
    const usedSlugs = new Set(existing.map((d: any) => d.slug).filter(Boolean));
    const slug = uniqueSlug(data.slug || data.name, usedSlugs);

    const payload = {
      data: {
        name: data.name,
        category: data.category || "Wisata Alam",
        kecamatan: data.kecamatan || "Sukadana",
        address: data.address || "",
        lat: Number(data.lat),
        lng: Number(data.lng),
        active: data.active !== undefined ? data.active : true,
        facilities: data.facilities || "",
        contact: data.contact || "",
        map_link: data.map_link || "",
        classification: data.classification || "Non Bintang",
        rooms: data.rooms !== undefined ? Number(data.rooms) : undefined,
        food_type: data.food_type || undefined,
        capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
        imageUrl: data.imageUrl || undefined,
        description: data.description || undefined,
        slug,
        gallery: Array.isArray(data.gallery) ? data.gallery : undefined,
        publishDate: data.publishDate || undefined,
        seoTitle: data.seoTitle || undefined,
        seoDesc: data.seoDesc || undefined,
      }
    };

    try {
      const item = await db.destinations.create(payload);
      return NextResponse.json(item, { status: 201 });
    } catch {
      const item = await jsonDb.destinations.create(payload);
      return NextResponse.json(item, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
