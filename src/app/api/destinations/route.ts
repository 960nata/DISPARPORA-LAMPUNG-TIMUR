import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const list = await db.destinations.findMany();
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.lat || !data.lng) {
      return NextResponse.json({ error: "Name and coordinates are required" }, { status: 400 });
    }

    const newDest = await db.destinations.create({
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
        capacity: data.capacity !== undefined ? Number(data.capacity) : undefined
      }
    });

    return NextResponse.json(newDest, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
