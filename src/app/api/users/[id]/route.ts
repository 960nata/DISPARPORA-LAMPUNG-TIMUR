import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, jsonDb } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";

const BCRYPT_ROUNDS = 12;
const VALID_ROLES = ["superadmin", "admin_dinas", "admin_post"] as const;

async function update(id: string, data: any) {
  try { return await db.users.update({ where: { id }, data }); }
  catch { return await jsonDb.users.update({ where: { id }, data }); }
}

async function del(id: string) {
  try { return await db.users.delete({ where: { id } }); }
  catch { return await jsonDb.users.delete({ where: { id } }); }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();

    // Role must be valid if provided
    if (data.role && !VALID_ROLES.includes(data.role)) {
      return NextResponse.json(
        { error: `Role tidak valid. Gunakan salah satu dari: ${VALID_ROLES.join(", ")}.` },
        { status: 400 }
      );
    }

    // Length guards
    if (data.name && String(data.name).length > 120) {
      return NextResponse.json({ error: "Nama terlalu panjang (maks. 120 karakter)." }, { status: 400 });
    }
    if (data.password && (String(data.password).length < 8 || String(data.password).length > 128)) {
      return NextResponse.json({ error: "Password harus antara 8–128 karakter." }, { status: 400 });
    }

    // Build update patch — only include explicitly provided fields
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = String(data.name).trim();
    if (data.role !== undefined) patch.role = data.role;
    if (data.email !== undefined) patch.email = String(data.email).trim().toLowerCase();
    if (data.password) {
      // Hash before storing
      patch.password = await bcrypt.hash(String(data.password), BCRYPT_ROUNDS);
    }
    if (data.permissions !== undefined) {
      patch.permissions =
        typeof data.permissions === "string"
          ? data.permissions
          : JSON.stringify(data.permissions);
    }

    const updated = await update(id, patch);
    const { password: _, ...safeUser } = updated as any;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Protect the root superadmin account from deletion
    if (id === "usr_superadmin") {
      return NextResponse.json(
        { error: "Akun Super Admin utama tidak dapat dihapus." },
        { status: 400 }
      );
    }

    // Prevent superadmin from deleting their own active session
    if (id === auth.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri." },
        { status: 400 }
      );
    }

    const deleted = await del(id);
    const { password: _, ...safeUser } = deleted as any;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
