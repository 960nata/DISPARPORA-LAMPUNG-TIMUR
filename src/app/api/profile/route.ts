import { NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const { userId, oldPassword, name, email, newPassword } = await request.json();

    if (!userId || !oldPassword) {
      return NextResponse.json({ error: "userId dan oldPassword wajib diisi" }, { status: 400 });
    }

    let user: any = null;
    try {
      user = await db.users.findUnique({ where: { id: userId } });
    } catch {
      user = await jsonDb.users.findUnique({ where: { id: userId } });
    }

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (user.password !== oldPassword) {
      return NextResponse.json({ error: "Password lama tidak cocok" }, { status: 401 });
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (newPassword) updateData.password = newPassword;

    let updated: any;
    try {
      updated = await db.users.update({ where: { id: userId }, data: updateData });
    } catch {
      updated = await jsonDb.users.update({ where: { id: userId }, data: updateData });
    }

    const { password: _, ...safeUser } = updated;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
