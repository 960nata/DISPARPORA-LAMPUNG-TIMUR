import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    let user: any = null;

    // Try primary db first, fall back to jsonDb if unreachable
    try {
      user = await db.users.findUnique({ where: { email } });
    } catch {
      user = await jsonDb.users.findUnique({ where: { email } });
    }

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
