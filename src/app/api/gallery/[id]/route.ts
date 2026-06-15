import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Only forward defined fields so we never clobber order/category with undefined
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.category !== undefined) patch.category = data.category;
    if (typeof data.order === "number") patch.order = data.order;

    const updated = await db.gallery.update({ where: { id }, data: patch });
    return NextResponse.json(updated);
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
    // Only remove the DB record. The physical file in /public/Gallery is kept,
    // since seed images are shared with the homepage GallerySection.
    const deleted = await db.gallery.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
