import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const list = await db.posts.findMany();
    // Sort by createdAt descending (newest first)
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(sorted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const newPost = await db.posts.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        imageUrl: data.imageUrl || "/Gallery/1.avif",
        authorId: data.authorId,
        status: data.status || "draft",
        tags: data.tags || "Umum",
        seoTitle: data.seoTitle || "",
        seoDesc: data.seoDesc || "",
        publishDate: data.publishDate || ""
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
