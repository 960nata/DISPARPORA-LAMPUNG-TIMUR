import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { db } from "@/lib/db";

// Re-generate on request so newly published berita/destinasi show up for crawlers.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static, publicly-indexable pages.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/profil`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/direktori`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/peta`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/berita`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/bidang`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/kontak`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  // Dynamic detail pages (routed by id). Failures must not break the sitemap.
  let posts: any[] = [];
  let destinations: any[] = [];
  try { posts = await db.posts.findMany(); } catch { posts = []; }
  try { destinations = await db.destinations.findMany(); } catch { destinations = []; }

  const beritaRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${SITE_URL}/berita/${p.id}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const direktoriRoutes: MetadataRoute.Sitemap = destinations
    .filter((d) => d.active)
    .map((d) => ({
      url: `${SITE_URL}/direktori/${d.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...beritaRoutes, ...direktoriRoutes];
}
