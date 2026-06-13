import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const list = await db.users.findMany();
    // Exclude passwords from returning to front end
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
      return NextResponse.json({ error: "Username, password, name, and role are required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.users.findUnique({
      where: { username: data.username }
    });

    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const newUser = await db.users.create({
      data: {
        username: data.username,
        password: data.password,
        name: data.name,
        role: data.role
      }
    });

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
