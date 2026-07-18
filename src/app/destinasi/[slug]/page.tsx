import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import DestinasiDetail from "./DestinasiDetail";

export const dynamic = "force-dynamic";

// Absolute URL for JSON-LD / Open Graph (crawlers need fully-qualified URLs).
function absUrl(path: string): string {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Strip HTML/block markup down to a plain-text excerpt for meta description.
function excerpt(content: string, max = 160): string {
  if (!content) return "";
  let rawText = "";

  const trimmed = content.trim();
  if (trimmed.startsWith("[")) {
    try {
      const blocks = JSON.parse(trimmed);
      if (Array.isArray(blocks)) {
        const textParts: string[] = [];
        for (const block of blocks) {
          if (!block || typeof block !== "object") continue;
          const d = block.data || {};
          if (block.type === "text") {
            const val = d.html || d.text || "";
            if (val) textParts.push(val);
          } else if (block.type === "grid" && Array.isArray(d.columns)) {
            for (const col of d.columns) {
              if (col) {
                const val = col.text || col.title || "";
                if (val) textParts.push(val);
              }
            }
          }
        }
        rawText = textParts.join(" ");
      }
    } catch {
      rawText = content;
    }
  } else {
    rawText = content;
  }

  const text = rawText
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

// Resolve by slug first, then legacy id. Cached so generateMetadata + the page
// body share a single DB read per request.
const findDest = cache(async (param: string) => {
  try {
    const all: any[] = await db.destinations.findMany();
    const bySlug = all.find((d) => d.slug && d.slug === param);
    if (bySlug) return bySlug;
    const byId = await db.destinations.findUnique({ where: { id: param } });
    return byId ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest: any = await findDest(slug);

  if (!dest) {
    return { title: "Destinasi Tidak Ditemukan", robots: { index: false, follow: true } };
  }

  const desc =
    dest.seoDesc ||
    excerpt(dest.description) ||
    `${dest.name} — destinasi ${dest.category?.toLowerCase() || "wisata"} di Kecamatan ${dest.kecamatan}, Lampung Timur.`;
  const url = `/destinasi/${dest.slug || dest.id}`;
  const image = dest.imageUrl || "/og-image.png";

  const getISOPublishDate = () => {
    if (dest.publishDate) {
      try { return new Date(dest.publishDate).toISOString(); } catch {}
    }
    if (dest.createdAt) {
      try { return new Date(dest.createdAt).toISOString(); } catch {}
    }
    return undefined;
  };

  return {
    // Root layout's title template appends the brand — keep this just the name.
    title: dest.seoTitle || dest.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: dest.seoTitle || dest.name,
      description: desc,
      url,
      images: [{ url: image }],
      publishedTime: getISOPublishDate(),
      authors: ["DISPARPORA Lampung Timur"],
      section: dest.category || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dest.seoTitle || dest.name,
      description: desc,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest: any = await findDest(slug);

  // Structured data → eligible for rich results (tourist attractions).
  const jsonLd = dest
    ? {
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        name: dest.name,
        description: excerpt(dest.description) || undefined,
        image: dest.imageUrl ? [absUrl(dest.imageUrl)] : undefined,
        url: absUrl(`/destinasi/${dest.slug || dest.id}`),
        touristType: dest.category || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: dest.address || undefined,
          addressLocality: dest.kecamatan || undefined,
          addressRegion: "Lampung",
          addressCountry: "ID",
        },
        geo:
          dest.lat && dest.lng
            ? { "@type": "GeoCoordinates", latitude: dest.lat, longitude: dest.lng }
            : undefined,
        telephone: dest.contact || undefined,
        isAccessibleForFree: true,
        publicAccess: dest.active !== false,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Kabupaten Lampung Timur",
        },
        provider: { "@type": "GovernmentOrganization", name: SITE_NAME },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DestinasiDetail param={slug} />
    </>
  );
}
