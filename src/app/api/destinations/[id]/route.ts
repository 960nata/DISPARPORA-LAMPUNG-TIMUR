import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

// Look up a destination by id first, then fall back to slug so both
// /api/destinations/<id> and /api/destinations/<slug> resolve.
async function findByIdOrSlug(engine: any, key: string) {
  const byId = await engine.destinations.findUnique({ where: { id: key } });
  if (byId) return byId;
  const all = await engine.destinations.findMany();
  return all.find((d: any) => d.slug && d.slug === key) ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      const dest = await findByIdOrSlug(db, id);
      if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(dest);
    } catch {
      const dest = await findByIdOrSlug(jsonDb, id);
      if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(dest);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();

    const payload = {
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        kecamatan: data.kecamatan,
        address: data.address,
        lat: Number(data.lat),
        lng: Number(data.lng),
        active: data.active,
        facilities: data.facilities,
        contact: data.contact,
        map_link: data.map_link,
        classification: data.classification,
        rooms: data.rooms !== undefined ? Number(data.rooms) : undefined,
        food_type: data.food_type || undefined,
        capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
        imageUrl: data.imageUrl || undefined,
        description: data.description || undefined,
        slug: data.slug || undefined,
        gallery: Array.isArray(data.gallery) ? data.gallery : undefined,
      }
    };

    try {
      return NextResponse.json(await db.destinations.update(payload));
    } catch {
      return NextResponse.json(await jsonDb.destinations.update(payload));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    try {
      return NextResponse.json(await db.destinations.delete({ where: { id } }));
    } catch {
      return NextResponse.json(await jsonDb.destinations.delete({ where: { id } }));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
