import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updated = await db.users.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        ...(data.password ? { password: data.password } : {}) // only update password if provided
      }
    });

    const { password: _, ...safeUser } = updated;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Prevent deleting the primary superadmin account during simulation
    if (id === "usr_superadmin") {
      return NextResponse.json({ error: "Akun Super Admin utama tidak dapat dihapus." }, { status: 400 });
    }

    const deleted = await db.users.delete({
      where: { id }
    });
    
    const { password: _, ...safeUser } = deleted;
    return NextResponse.json(safeUser);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
