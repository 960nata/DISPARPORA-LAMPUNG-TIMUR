import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";

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

    const updated = await update(id, {
      name: data.name,
      role: data.role,
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.password ? { password: data.password } : {}),
      ...(data.permissions !== undefined ? { permissions: typeof data.permissions === "string" ? data.permissions : JSON.stringify(data.permissions) } : {}),
    });

    const { password: _, ...safeUser } = updated as any;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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

    if (id === "usr_superadmin") {
      return NextResponse.json({ error: "Akun Super Admin utama tidak dapat dihapus." }, { status: 400 });
    }

    const deleted = await del(id);
    const { password: _, ...safeUser } = deleted as any;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
