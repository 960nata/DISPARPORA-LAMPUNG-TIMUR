import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    return NextResponse.json(await db.partners.findMany());
  } catch {
    try {
      return NextResponse.json(await jsonDb.partners.findMany());
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
    const payload = { name: data.name, logoUrl: data.logoUrl };
    try {
      return NextResponse.json(await db.partners.create({ data: payload }));
    } catch {
      return NextResponse.json(await jsonDb.partners.create({ data: payload }));
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
