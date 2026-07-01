import { NextRequest, NextResponse } from "next/server";
import { db, usingMockDb, prismaInitError } from "@/lib/db";
import { requireAuth } from "@/lib/session";

// Never cache — must reflect live runtime state on each request.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health/db
 *
 * Diagnostic endpoint. Reports whether the running instance is talking to
 * Postgres (Supabase) or has silently degraded to the ephemeral in-memory /
 * JSON store — the latter is what makes newly-created posts "muncul sebentar
 * lalu hilang" on Vercel. Hit this on the deployed URL to see the real state.
 *
 * Gated behind auth so Prisma error details (which may include the DB host)
 * are not exposed publicly.
 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;

  // Attempt a real query so we know the connection actually works, not just
  // that the client object was constructed.
  let canQuery = false;
  let queryError: string | null = null;
  let postCount: number | null = null;
  try {
    const posts = await db.posts.findMany();
    postCount = posts.length;
    canQuery = true;
  } catch (e: any) {
    queryError = e?.message ?? String(e);
  }

  // The verdict the user actually needs.
  const store = usingMockDb ? "JSON_EPHEMERAL" : "POSTGRES";
  const healthy = !usingMockDb && canQuery;

  return NextResponse.json(
    {
      healthy,
      store,                 // "POSTGRES" = good, "JSON_EPHEMERAL" = data will vanish on Vercel
      usingMockDb,           // true = Prisma NOT active → writes are ephemeral
      hasDatabaseUrl,
      hasDirectUrl,
      prismaInitError,       // why Prisma failed to init (null if it initialised)
      canQuery,
      queryError,
      postCount,
      nodeVersion: process.version,
    },
    { status: healthy ? 200 : 503 }
  );
}
