import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Traffic is written on every navigation — never cache.
export const dynamic = "force-dynamic";

// Keep only real, in-site page paths. Drop assets, api calls, and junk.
function cleanPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let path = raw.split("#")[0].split("?")[0].trim();
  if (!path.startsWith("/")) return null;
  if (/\.(png|jpe?g|avif|webp|svg|ico|css|js|json|map|txt|woff2?)$/i.test(path)) return null;
  if (path.startsWith("/api/")) return null;
  if (path.length > 300) path = path.slice(0, 300);
  return path;
}

const cap = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

/**
 * POST /api/track — record one page view (PUBLIC, no auth).
 * Location is derived from edge geo headers (Vercel) — the raw IP is never stored.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = cleanPath(body?.path);
    if (!path) return NextResponse.json({ error: "path wajib" }, { status: 400 });

    const h = req.headers;
    const decode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
    const num = (s: string | null) => {
      const n = s ? parseFloat(s) : NaN;
      return Number.isFinite(n) ? n : null;
    };

    await db.pageViews.record({
      path,
      session: cap(body?.session, 60),
      visitor: cap(body?.visitor, 60),
      isNew: body?.isNew === true,
      country: cap(h.get("x-vercel-ip-country"), 8),
      region: cap(h.get("x-vercel-ip-country-region"), 60),
      city: cap(decode(h.get("x-vercel-ip-city") || ""), 80),
      lat: num(h.get("x-vercel-ip-latitude")),
      lng: num(h.get("x-vercel-ip-longitude")),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    // Tracking must never break the visitor's experience — swallow errors.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
