import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    let posts: any[];
    let useJsonDb = false;
    try {
      posts = await db.posts.findMany();
    } catch {
      posts = await jsonDb.posts.findMany();
      useJsonDb = true;
    }

    const drafts = posts.filter((p: any) => p.status !== "published");
    let updated = 0;

    for (const post of drafts) {
      try {
        if (useJsonDb) {
          await jsonDb.posts.update({ where: { id: post.id }, data: { status: "published" } });
        } else {
          try {
            await db.posts.update({ where: { id: post.id }, data: { status: "published" } });
          } catch {
            await jsonDb.posts.update({ where: { id: post.id }, data: { status: "published" } });
          }
        }
        updated++;
      } catch {
        // skip if single update fails
      }
    }

    return NextResponse.json({ updated, total: posts.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
