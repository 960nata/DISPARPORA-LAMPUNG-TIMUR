import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    const list = await db.athletes.findMany();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(await jsonDb.athletes.findMany());
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    if (!data.nama || !data.cabor || !data.juara || !data.event) {
      return NextResponse.json({ error: "Nama, cabor, juara, and event are required" }, { status: 400 });
    }

    const payload = {
      data: {
        nama: data.nama,
        cabor: data.cabor,
        juara: data.juara,
        event: data.event,
      }
    };

    try {
      const item = await db.athletes.create(payload);
      return NextResponse.json(item, { status: 201 });
    } catch {
      const item = await jsonDb.athletes.create(payload);
      return NextResponse.json(item, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
