import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    const list = await db.posts.findMany();
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(sorted);
  } catch {
    try {
      const list = await jsonDb.posts.findMany();
      const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(sorted);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    if (!data.title || !data.content || !data.authorId) {
      return NextResponse.json({ error: "Title, content, and author are required" }, { status: 400 });
    }

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const payload = {
      title: data.title, slug, content: data.content,
      imageUrl: data.imageUrl || "/Gallery/1.avif", authorId: data.authorId,
      status: data.status || "draft", tags: data.tags || "Umum",
      seoTitle: data.seoTitle || "", seoDesc: data.seoDesc || "", publishDate: data.publishDate || ""
    };
    try {
      return NextResponse.json(await db.posts.create({ data: payload }), { status: 201 });
    } catch {
      return NextResponse.json(await jsonDb.posts.create({ data: payload }), { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
