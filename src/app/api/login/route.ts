import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { signSession, SESSION_COOKIE_OPTIONS } from "@/lib/session";

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
    const token = signSession(user.id, user.role);

    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set("simad_auth", token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
