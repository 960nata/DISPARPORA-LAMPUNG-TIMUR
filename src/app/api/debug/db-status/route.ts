import { NextResponse } from "next/server";
import { db, usingMockDb, prismaInitError } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/debug/db-status
 * Temporary debug endpoint — remove after diagnosis.
 */
export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;

  let canQuery = false;
  let queryError: string | null = null;
  let postCount: number | null = null;
  let firstPostTitle: string | null = null;
  try {
    const posts = await db.posts.findMany();
    postCount = posts.length;
    if (posts.length > 0) firstPostTitle = posts[0].title;
    canQuery = true;
  } catch (e: any) {
    queryError = e?.message ?? String(e);
  }

  const store = usingMockDb ? "JSON_EPHEMERAL" : "POSTGRES";
  const healthy = !usingMockDb && canQuery;

  return NextResponse.json({
    healthy,
    store,
    usingMockDb,
    hasDatabaseUrl,
    hasDirectUrl,
    prismaInitError,
    canQuery,
    queryError,
    postCount,
    firstPostTitle,
  }, { status: healthy ? 200 : 503 });
}
