// Canonical public URL of the site — used for SEO metadata, sitemap, robots,
// Open Graph, and JSON-LD. Override per-environment with NEXT_PUBLIC_SITE_URL
// (e.g. the Vercel preview URL) without touching code.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://disparpora.lampungtimurkab.go.id"
).replace(/\/$/, "");

export const SITE_NAME = "Dinas Pariwisata, Pemuda dan Olahraga Kabupaten Lampung Timur";
export const SITE_SHORT = "DISPARPORA Lampung Timur";
