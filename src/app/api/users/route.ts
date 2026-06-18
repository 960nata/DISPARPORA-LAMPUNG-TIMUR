import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

async function findMany() {
  try { return await db.users.findMany(); }
  catch { return await jsonDb.users.findMany(); }
}

async function findUnique(where: { username?: string; id?: string }) {
  try { return await db.users.findUnique({ where }); }
  catch { return await jsonDb.users.findUnique({ where }); }
}

async function create(data: any) {
  try { return await db.users.create({ data }); }
  catch { return await jsonDb.users.create({ data }); }
}

export async function GET() {
  try {
    const list = await findMany();
    const safeList = list.map(({ password: _, ...rest }: any) => rest);
    return NextResponse.json(safeList);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.username || !data.password || !data.name || !data.role) {
      return NextResponse.json({ error: "Username, password, name, dan role wajib diisi" }, { status: 400 });
    }

    const existing = await findUnique({ username: data.username });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const newUser = await create({
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role,
      ...(data.email ? { email: data.email } : {}),
      ...(data.permissions !== undefined ? { permissions: typeof data.permissions === "string" ? data.permissions : JSON.stringify(data.permissions) } : {}),
    });

    const { password: _, ...safeUser } = newUser as any;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
