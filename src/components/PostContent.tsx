"use client";

import { useEffect, useMemo, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

interface Block { id: string; type: string; data: any }
interface GalleryItem { id: string; imageUrl: string; title: string }

// Same YouTube/Vimeo → embed conversion the editor uses.
function videoEmbed(url: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// Content is either a JSON block array (from the block editor) or legacy
// plain text / HTML. Returns the blocks, or null when it's legacy content.
function parseBlocks(content: string): Block[] | null {
  const trimmed = (content || "").trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.every(b => b && typeof b === "object" && "type" in b)) {
      return parsed as Block[];
    }
  } catch { /* not JSON → legacy */ }
  return null;
}

const cap: React.CSSProperties = { fontSize: "0.82rem", color: "var(--text-secondary)", textAlign: "center", marginTop: "0.5rem" };
const imgStyle: React.CSSProperties = { width: "100%", borderRadius: "12px", border: "1px solid var(--border)", display: "block" };

export default function PostContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const [gallery, setGallery] = useState<Record<string, GalleryItem>>({});

  const needsGallery = !!blocks?.some(b => b.type === "gallery");
  useEffect(() => {
    if (!needsGallery) return;
    fetch("/api/gallery")
      .then(r => r.json())
      .then((list) => {
        if (!Array.isArray(list)) return;
        const m: Record<string, GalleryItem> = {};
        for (const g of list) m[g.id] = g;
        setGallery(m);
      })
      .catch(() => { /* ignore */ });
  }, [needsGallery]);

  // ── Legacy content (plain text or raw HTML) ──
  if (!blocks) {
    const c = content || "";
    if (c.includes("<")) {
      return <div className="post-rich" dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }} />;
    }
    return (
      <div className="post-rich" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {c.split("\n").filter(p => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    );
  }

  return (
    <div className="post-rich" style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
      {blocks.map((block) => {
        const d = block.data || {};
        switch (block.type) {
          case "text":
            return <div key={block.id} dangerouslySetInnerHTML={{ __html: sanitizeHtml(d.html || "") }} />;

          case "image":
            if (!d.src) return null;
            return (
              <figure key={block.id} style={{ margin: 0 }}>
                <img src={d.src} alt={d.alt || ""} style={imgStyle} />
                {d.caption && <figcaption style={cap}>{d.caption}</figcaption>}
              </figure>
            );

          case "gallery": {
            const items = (d.selectedIds || []).map((id: string) => gallery[id]).filter(Boolean) as GalleryItem[];
            if (items.length === 0) return null;
            return (
              <figure key={block.id} style={{ margin: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.6rem" }}>
                  {items.map(g => (
                    <img key={g.id} src={g.imageUrl} alt={g.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }} />
                  ))}
                </div>
                {d.caption && <figcaption style={cap}>{d.caption}</figcaption>}
              </figure>
            );
          }

          case "carousel": {
            const slides = (d.slides || []) as { id: string; src: string; title: string; subtitle: string }[];
            if (slides.length === 0) return null;
            const cols = d.cols || 1;
            return (
              <div key={block.id} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: "0.75rem" }}>
                {slides.map(s => (
                  <figure key={s.id} style={{ margin: 0, position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={s.src} alt={s.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                    {(s.title || s.subtitle) && (
                      <figcaption style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0.9rem", color: "#fff", background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                        {s.title && <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{s.title}</div>}
                        {s.subtitle && <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>{s.subtitle}</div>}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            );
          }

          case "grid": {
            const columns = (d.columns || []) as { image?: string; title: string; text: string }[];
            const numCols = d.cols || columns.length || 1;
            if (columns.length === 0) return null;
            return (
              <div key={block.id} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(numCols, 3)}, 1fr)`, gap: "1rem" }}>
                {columns.slice(0, numCols).map((col, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                    {col.image && <img src={col.image} alt={col.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }} />}
                    {col.title && <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>{col.title}</h3>}
                    {col.text && <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>{col.text}</p>}
                  </div>
                ))}
              </div>
            );
          }

          case "video":
          case "youtube":
          case "iframe": {
            const embed = videoEmbed(d.url || d.src || "");
            if (!embed) return null;
            return (
              <figure key={block.id} style={{ margin: 0 }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "12px", overflow: "hidden", background: "#000" }}>
                  <iframe src={embed} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen title={d.title || "Video"} />
                </div>
                {d.title && <figcaption style={cap}>{d.title}</figcaption>}
              </figure>
            );
          }

          case "html":
            return (
              <div key={block.id} style={{ minWidth: 0, maxWidth: "100%", overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ display: "inline-block", minWidth: "100%" }} dangerouslySetInnerHTML={{ __html: d.code || d.content || "" }} />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
