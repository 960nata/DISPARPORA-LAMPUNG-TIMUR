import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const posts = await db.posts.findMany();
    const drafts = posts.filter((p: any) => p.status !== "published");
    let updated = 0;

    for (const post of drafts) {
      try {
        await db.posts.update({ where: { id: post.id }, data: { status: "published" } });
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
