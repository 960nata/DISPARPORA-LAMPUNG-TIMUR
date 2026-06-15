import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function GET() {
  try {
    const list = await db.gallery.findMany();
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title || !data.category) {
      return NextResponse.json({ error: "Judul dan kategori wajib diisi" }, { status: 400 });
    }

    let imageUrl: string = data.imageUrl || "";

    // If a base64 image was uploaded, convert to AVIF and write to /public/Gallery
    if (typeof data.imageData === "string" && data.imageData.startsWith("data:image/")) {
      const base64 = data.imageData.split(",")[1] || "";
      const buf = Buffer.from(base64, "base64");
      const slug = String(data.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "foto";
      const filename = `${slug}-${Date.now()}.avif`;
      const dir = path.join(process.cwd(), "public", "Gallery");
      await fs.mkdir(dir, { recursive: true });
      await sharp(buf)
        .resize({ width: 1600, withoutEnlargement: true })
        .avif({ quality: 55, effort: 4 })
        .toFile(path.join(dir, filename));
      imageUrl = `/Gallery/${filename}`;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Gambar wajib diunggah atau diisi URL-nya" }, { status: 400 });
    }

    const item = await db.gallery.create({
      data: { title: data.title, category: data.category, imageUrl }
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
