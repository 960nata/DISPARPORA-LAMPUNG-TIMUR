import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();
    const payload = {
      title: data.title,
      date: data.date,
      time: data.time || "",
      location: data.location,
      desc: data.desc || "",
      status: data.status,
      image: data.image || "",
      guests: data.guests || "",
    };
    const item = await db.events.update({ where: { id }, data: payload });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const item = await db.events.delete({ where: { id } });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
