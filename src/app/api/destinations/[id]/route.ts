import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dest = await db.destinations.findUnique({ where: { id } });
    if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(dest);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updated = await db.destinations.update({
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
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.destinations.delete({
      where: { id }
    });
    return NextResponse.json(deleted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
