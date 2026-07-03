import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

const BCRYPT_ROUNDS = 12;

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    let user: any = null;
    try {
      user = await db.users.findUnique({ where: { id: auth.id } });
    } catch {
      user = await jsonDb.users.findUnique({ where: { id: auth.id } });
    }

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { userId, oldPassword, name, email, newPassword } = body;

    // ── Authorisation: user can only edit their own profile ──
    if (!userId || userId !== auth.id) {
      return NextResponse.json(
        { error: "Anda hanya dapat mengubah profil milik sendiri." },
        { status: 403 }
      );
    }

    if (!oldPassword) {
      return NextResponse.json(
        { error: "Password lama wajib diisi untuk memperbarui profil." },
        { status: 400 }
      );
    }

    // Input length guards
    if (name && name.length > 120) {
      return NextResponse.json({ error: "Nama terlalu panjang (maks. 120 karakter)." }, { status: 400 });
    }
    if (email && email.length > 254) {
      return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
    }
    if (newPassword && (newPassword.length < 8 || newPassword.length > 128)) {
      return NextResponse.json(
        { error: "Password baru harus antara 8–128 karakter." },
        { status: 400 }
      );
    }

    // ── Fetch user ──────────────────────────────────────
    let user: any = null;
    try {
      user = await db.users.findUnique({ where: { id: userId } });
    } catch {
      user = await jsonDb.users.findUnique({ where: { id: userId } });
    }

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // ── Verify old password (supports both bcrypt and legacy plaintext) ──
    const storedPassword: string = user.password ?? "";
    let oldPasswordValid = false;

    if (storedPassword.startsWith("$2")) {
      oldPasswordValid = await bcrypt.compare(oldPassword, storedPassword);
    } else {
      oldPasswordValid = storedPassword === oldPassword;
    }

    if (!oldPasswordValid) {
      return NextResponse.json({ error: "Password lama tidak cocok." }, { status: 401 });
    }

    // ── Build update payload ─────────────────────────────
    const updateData: Record<string, any> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    } else if (!storedPassword.startsWith("$2")) {
      // Opportunistically upgrade legacy plaintext hash even if not changing password
      updateData.password = await bcrypt.hash(oldPassword, BCRYPT_ROUNDS);
    }

    let updated: any;
    try {
      updated = await db.users.update({ where: { id: userId }, data: updateData });
    } catch {
      updated = await jsonDb.users.update({ where: { id: userId }, data: updateData });
    }

    const { password: _, ...safeUser } = updated;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
