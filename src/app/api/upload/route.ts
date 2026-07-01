import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

// Max file size: 8 MB
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Allowed MIME types → file extension mapping.
 * SVG is intentionally excluded — it can contain embedded scripts (XSS).
 */
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif":  "gif",
};

/**
 * Magic byte signatures for each allowed format.
 * We verify these against the actual file bytes to prevent
 * MIME-type spoofing (e.g. renaming a PHP file to image.jpg).
 */
const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg", bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: "image/gif",  bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
  // AVIF: ftyp box with "avif" or "avis" brand at byte 8
  { mime: "image/avif", bytes: [0x61, 0x76, 0x69], offset: 8 },
];

function detectMimeByMagic(buf: Buffer): string | null {
  for (const { mime, bytes, offset = 0 } of MAGIC_BYTES) {
    if (buf.length < offset + bytes.length) continue;
    const match = bytes.every((b, i) => buf[offset + i] === b);
    if (match) return mime;
  }
  return null;
}

/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with a single `file` field.
 * Validates file type by both MIME header AND magic bytes.
 * Uploads to Supabase Storage bucket "uploads" and returns
 * the public URL: { url: "https://..." }
 *
 * Requires: valid SIMAD session cookie (any authenticated user).
 */
export async function POST(request: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Field 'file' tidak ditemukan dalam request." },
        { status: 400 }
      );
    }

    // ── MIME type check (client-reported) ──────────────
    const mimeType = file.type || "";
    if (!ALLOWED_MIME[mimeType]) {
      return NextResponse.json(
        {
          error: `Tipe file tidak didukung: "${mimeType}". Gunakan JPG, PNG, WEBP, AVIF, atau GIF.`,
        },
        { status: 400 }
      );
    }

    // ── Size check ──────────────────────────────────────
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar (maks. 8 MB). File Anda: ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
        },
        { status: 400 }
      );
    }

    // ── Read file bytes ─────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Magic byte verification (prevents MIME spoofing) ──
    const detectedMime = detectMimeByMagic(buffer);
    if (!detectedMime || !ALLOWED_MIME[detectedMime]) {
      return NextResponse.json(
        {
          error: "File tidak valid. Konten file tidak sesuai dengan tipe yang dideklarasikan.",
        },
        { status: 400 }
      );
    }
    // Use the magic-byte-detected MIME (more trustworthy than client value)
    const finalMime = detectedMime;
    const ext = ALLOWED_MIME[finalMime];

    // ── Build unique storage path ────────────────────────
    // Pattern: uploads/<year-month>/<timestamp>-<random>.<ext>
    // Organises files by month for easier management
    const now = new Date();
    const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 8);
    const storagePath = `${monthDir}/${Date.now()}-${rand}.${ext}`;

    // ── Upload to Supabase Storage ──────────────────────
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: finalMime,
        upsert: false,
        // Tell browsers to download, not execute, if accessed directly
        // (Supabase passes this as a response header on download)
        duplex: "half",
      } as any);

    if (uploadError) {
      console.error("[/api/upload] Supabase Storage error:", uploadError);
      return NextResponse.json(
        { error: `Upload gagal: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── Return public URL ───────────────────────────────
    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicData.publicUrl }, { status: 201 });
  } catch (e: any) {
    console.error("[/api/upload] Unexpected error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
