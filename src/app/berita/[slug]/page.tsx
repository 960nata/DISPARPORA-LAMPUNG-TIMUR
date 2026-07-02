import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@/lib/db";
import { SITE_SHORT, SITE_NAME, SITE_URL } from "@/lib/site";
import BeritaArticle from "./BeritaArticle";

export const dynamic = "force-dynamic";

// Absolute URL for JSON-LD / Open Graph (crawlers need fully-qualified URLs).
function absUrl(path: string): string {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Strip HTML/block markup down to a plain-text excerpt for meta description.
function excerpt(content: string, max = 160): string {
  const text = (content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

// Cached so generateMetadata + the page body share a single DB read per request.
const findPost = cache(async (param: string) => {
  try {
    const posts: any[] = await db.posts.findMany();
    return posts.find((p) => p.slug === param) || posts.find((p) => p.id === param) || null;
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
  const post = await findPost(slug);

  if (!post) {
    return { title: "Artikel Tidak Ditemukan", robots: { index: false, follow: true } };
  }

  const desc = excerpt(post.content) || `Berita ${SITE_SHORT}`;
  const url = `/berita/${post.slug || post.id}`;
  const image = post.imageUrl || "/og-image.png";

  return {
    title: post.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: desc,
      url,
      images: [{ url: image }],
      publishedTime: post.createdAt,
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags ? post.tags.split(",").map((t: string) => t.trim()) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPost(slug);

  // Structured data → eligible for Google News / rich results.
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: post.title,
        description: excerpt(post.content),
        image: [absUrl(post.imageUrl || "/og-image.png")],
        datePublished: post.createdAt || undefined,
        dateModified: post.updatedAt || post.createdAt || undefined,
        author: {
          "@type": post.authorName ? "Person" : "Organization",
          name: post.authorName || SITE_NAME,
        },
        publisher: {
          "@type": "GovernmentOrganization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: absUrl("/icon.png") },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": absUrl(`/berita/${post.slug || post.id}`),
        },
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
      <BeritaArticle param={slug} />
    </>
  );
}
