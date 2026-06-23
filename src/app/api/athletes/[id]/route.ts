import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      const athlete = await db.athletes.findUnique({ where: { id } });
      if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(athlete);
    } catch {
      const athlete = await jsonDb.athletes.findUnique({ where: { id } });
      if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(athlete);
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
        nama: data.nama,
        cabor: data.cabor,
        juara: data.juara,
        event: data.event,
      }
    };

    try {
      return NextResponse.json(await db.athletes.update(payload));
    } catch {
      return NextResponse.json(await jsonDb.athletes.update(payload));
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
      return NextResponse.json(await db.athletes.delete({ where: { id } }));
    } catch {
      return NextResponse.json(await jsonDb.athletes.delete({ where: { id } }));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
