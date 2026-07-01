import { NextRequest, NextResponse } from "next/server";
import { jsonStore } from "@/lib/db";
import { checkRateLimit, LIKE_RATE_LIMIT } from "@/lib/rateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ── Rate limit: max 3 likes per IP per destination per hour ──
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateResult = checkRateLimit(`like:${ip}:${id}`, LIKE_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(rateResult.retryAfterSeconds) },
        }
      );
    }

    // ── Basic ID validation ─────────────────────────────
    if (!id || id.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const updated = await jsonStore.destinations.incrementLikes({ where: { id } });
    return NextResponse.json({ id, likes: updated.likes ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
  }
}
