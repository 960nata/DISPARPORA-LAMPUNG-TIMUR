import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Friendly names for the "Halaman Populer" list.
const NAMED: Record<string, string> = {
  "/": "Beranda",
  "/direktori": "Direktori Wisata",
  "/profil": "Profil Dinas",
  "/peta": "Peta Wisata Interaktif",
  "/berita": "Berita & Artikel",
  "/bidang": "Bidang Dinas",
  "/kontak": "Kontak",
  "/dashboard": "Dashboard Admin",
};
function labelFor(path: string): string {
  if (NAMED[path]) return NAMED[path];
  if (path.startsWith("/direktori/")) return "Detail Destinasi";
  if (path.startsWith("/berita/")) return "Detail Berita";
  if (path.startsWith("/bidang/")) return "Detail Bidang";
  if (path.startsWith("/dashboard")) return "Dashboard Admin";
  return path;
}

const NEGARA: Record<string, string> = {
  ID: "Indonesia", SG: "Singapura", MY: "Malaysia", US: "Amerika Serikat",
  JP: "Jepang", KR: "Korea Selatan", AU: "Australia", GB: "Inggris", NL: "Belanda",
};
function countryName(code: string) {
  return NEGARA[code] || code || "";
}

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const hourKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

type Spec = { buckets: { key: string; label: string }[]; keyFn: (d: Date) => string; since: Date };

function hourBuckets(now: Date): Spec {
  const base = startOfDay(now);
  const buckets = Array.from({ length: 24 }, (_, hh) => {
    const d = new Date(base); d.setHours(hh);
    return { key: hourKey(d), label: String(hh).padStart(2, "0") };
  });
  return { buckets, keyFn: hourKey, since: base };
}
function dayBuckets(now: Date, n: number): Spec {
  const base = startOfDay(now);
  const buckets = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    buckets.push({ key: dayKey(d), label: n <= 7 ? HARI[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}` });
  }
  const since = new Date(base); since.setDate(since.getDate() - (n - 1));
  return { buckets, keyFn: dayKey, since };
}
function monthBuckets(now: Date, n: number): Spec {
  const buckets = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: monthKey(d), label: n > 12 ? `${BULAN[d.getMonth()]} '${String(d.getFullYear()).slice(2)}` : BULAN[d.getMonth()] });
  }
  const since = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return { buckets, keyFn: monthKey, since };
}

function specFor(range: string, now: Date): Spec {
  switch (range) {
    case "hari-ini": return hourBuckets(now);
    case "minggu": return dayBuckets(now, 7);
    case "bulan": return dayBuckets(now, 30);
    case "3bulan": return dayBuckets(now, 90);
    case "6bulan": return monthBuckets(now, 6);
    case "9bulan": return monthBuckets(now, 9);
    case "tahun": return monthBuckets(now, 12);
    default: return dayBuckets(now, 30);
  }
}

/**
 * GET /api/analytics?range=hari-ini|minggu|bulan|3bulan|6bulan|9bulan|tahun
 * Aggregated page-view traffic. No raw IP — location is approximate geo only.
 */
export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") || "bulan";
    const now = new Date();
    const { buckets, keyFn, since } = specFor(range, now);

    const rows: any[] = await db.pageViews.findSince({ since: since.toISOString() });

    // Time series
    const counts = new Map(buckets.map(b => [b.key, 0]));
    for (const r of rows) {
      const k = keyFn(new Date(r.createdAt));
      if (counts.has(k)) counts.set(k, (counts.get(k) || 0) + 1);
    }
    const series = { labels: buckets.map(b => b.label), data: buckets.map(b => counts.get(b.key) || 0) };

    // Totals
    const views = rows.length;
    const sessions = new Set(rows.map(r => r.session).filter(Boolean)).size;
    const newVisits = rows.filter(r => r.isNew).length;
    const returningVisits = views - newVisits;
    const avgPerSession = sessions ? Math.round((views / sessions) * 10) / 10 : 0;

    // Popular pages
    const byPath = new Map<string, number>();
    for (const r of rows) byPath.set(r.path, (byPath.get(r.path) || 0) + 1);
    const popular = [...byPath.entries()]
      .map(([path, v]) => ({ path, label: labelFor(path), views: v }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Visitor origin from geo-IP coordinates — accurate only to city/province.
    // Never a raw IP; grouped by region/city with representative coordinates.
    const byLoc = new Map<string, { name: string; views: number; lat: number | null; lng: number | null }>();
    for (const r of rows) {
      const name = r.region || r.city || countryName(r.country) || "Tidak diketahui";
      const cur = byLoc.get(name) || { name, views: 0, lat: null, lng: null };
      cur.views++;
      if (cur.lat == null && r.lat != null && r.lng != null) { cur.lat = r.lat; cur.lng = r.lng; }
      byLoc.set(name, cur);
    }
    const locAll = [...byLoc.values()].sort((a, b) => b.views - a.views);
    const locations = locAll.slice(0, 10).map(({ name, views }) => ({ name, views }));
    const originPoints = locAll.filter(l => l.lat != null && l.lng != null);

    // Per-kecamatan (Lampung Timur): accumulate destinasi page views by the
    // kecamatan of the destination that was viewed. Uses real destination
    // coordinates — accurate, unlike IP-based kecamatan guessing.
    let destinations: any[] = [];
    try { destinations = await db.destinations.findMany(); } catch { destinations = []; }
    const destByKey = new Map<string, any>();
    for (const d of destinations) {
      if (d.slug) destByKey.set(d.slug, d);
      if (d.id) destByKey.set(d.id, d);
    }
    const kecMap = new Map<string, { name: string; views: number; latSum: number; lngSum: number; n: number }>();
    for (const r of rows) {
      const m = /^\/destinasi\/([^/?#]+)/.exec(r.path || "");
      if (!m) continue;
      const dest = destByKey.get(decodeURIComponent(m[1]));
      if (!dest || !dest.kecamatan) continue;
      const cur = kecMap.get(dest.kecamatan) || { name: dest.kecamatan, views: 0, latSum: 0, lngSum: 0, n: 0 };
      cur.views++;
      if (Number.isFinite(dest.lat) && Number.isFinite(dest.lng)) {
        cur.latSum += Number(dest.lat); cur.lngSum += Number(dest.lng); cur.n++;
      }
      kecMap.set(dest.kecamatan, cur);
    }
    const kecamatanViews = [...kecMap.values()]
      .map(k => ({ name: k.name, views: k.views, lat: k.n ? k.latSum / k.n : null, lng: k.n ? k.lngSum / k.n : null }))
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({
      range,
      totals: { views, sessions, newVisits, returningVisits, avgPerSession },
      series,
      popular,
      locations,
      originPoints,
      kecamatanViews,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "gagal memuat analitik" }, { status: 500 });
  }
}
