import { NextRequest, NextResponse } from "next/server";
import { db, jsonDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

// Always reflect the latest inbox state — never cache the admin listing.
export const dynamic = "force-dynamic";

/**
 * GET /api/messages — list all contact messages (admin only).
 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    return NextResponse.json(await db.messages.findMany());
  } catch {
    return NextResponse.json(await jsonDb.messages.findMany());
  }
}

/**
 * POST /api/messages — submit a contact message (PUBLIC, no auth).
 * Called by the /kontak "Kirim Pesan" form.
 */
export async function POST(request: NextRequest) {
  // ── Rate limiting: keyed by IP (max 5 per 15 mins) ──────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateResult = checkRateLimit(`message:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
  });
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak mengirim pesan. Coba lagi dalam ${rateResult.retryAfterSeconds} detik.` },
      { status: 429 }
    );
  }

  try {
    const data = await request.json();

    // Server-side validation (mirrors the client form rules).
    const nama   = typeof data.nama === "string" ? data.nama.trim() : "";
    const email  = typeof data.email === "string" ? data.email.trim() : "";
    const subjek = typeof data.subjek === "string" ? data.subjek.trim() : "";
    const pesan  = typeof data.pesan === "string" ? data.pesan.trim() : "";

    if (!nama || !email || !subjek) {
      return NextResponse.json({ error: "Nama, email, dan subjek wajib diisi." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (pesan.length < 10) {
      return NextResponse.json({ error: "Pesan minimal 10 karakter." }, { status: 400 });
    }

    // Basic length caps to avoid abuse / oversized payloads.
    const payload = {
      data: {
        nama:   nama.slice(0, 120),
        email:  email.slice(0, 160),
        subjek: subjek.slice(0, 200),
        pesan:  pesan.slice(0, 5000),
      },
    };

    try {
      const item = await db.messages.create(payload);
      return NextResponse.json(item, { status: 201 });
    } catch {
      const item = await jsonDb.messages.create(payload);
      return NextResponse.json(item, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
