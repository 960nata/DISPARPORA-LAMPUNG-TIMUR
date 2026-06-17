"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ArrowLeft, BookOpen, Clock, Tag, RefreshCw, ChevronRight, Share2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWithRetry } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  authorName: string;
  createdAt: string;
  status: string;
  tags: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost]             = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [related, setRelated]       = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchWithRetry("/api/posts")
      .then(r => r.json())
      .then((data: Post[]) => {
        if (!Array.isArray(data)) return;
        const matched = data.find(p => p.id === id);
        if (matched) {
          setPost(matched);
          // Related: share at least one tag
          const myTags = matched.tags.split(",").map(t => t.trim().toLowerCase());
          const rel = data
            .filter(p => p.status === "published" && p.id !== id)
            .filter(p => p.tags.split(",").some(t => myTags.includes(t.trim().toLowerCase())))
            .slice(0, 3);
          setRelated(rel);
        }
        setRecentPosts(data.filter(p => p.status === "published" && p.id !== id).slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const copyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: "0.5rem" }}>
        <RefreshCw size={24} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
        <span>Memuat artikel...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Artikel Tidak Ditemukan</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Maaf, berita yang Anda cari tidak tersedia atau sudah dihapus.</p>
        <Link href="/berita" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex", gap: "0.5rem", borderRadius: "12px" }}>
          <ArrowLeft size={16} /> Kembali ke Portal Berita
        </Link>
      </div>
    );
  }

  const wordCount   = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const paragraphs  = post.content.split("\n").filter(p => p.trim());
  const pageUrl     = typeof window !== "undefined" ? window.location.href : "";
  const shareWA     = `https://wa.me/?text=${encodeURIComponent(post.title + "\n" + pageUrl)}`;
  const shareX      = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`;
  const shareEmail  = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(post.title + "\n\n" + pageUrl)}`;

  return (
    <div style={{ paddingBottom: "5rem" }}>
      <div className="container" style={{ paddingTop: "2.5rem" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Beranda</Link>
          <ChevronRight size={13} />
          <Link href="/berita" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Berita</Link>
          <ChevronRight size={13} />
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>{post.title.length > 50 ? post.title.slice(0, 50) + "…" : post.title}</span>
        </nav>

        {/* Main split layout */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>

          {/* Article Body */}
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Cover Image */}
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", aspectRatio: "16/7" }}>
              <img src={post.imageUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.82rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Calendar size={14} style={{ color: "var(--primary)" }} />
                {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <User size={14} style={{ color: "var(--primary)" }} />
                {post.authorName}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Clock size={14} style={{ color: "var(--primary)" }} />
                {readingTime} menit baca
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.25 }}>
              {post.title}
            </h1>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
              <Tag size={13} style={{ color: "var(--text-muted)" }} />
              {post.tags.split(",").map((tag, i) => (
                <span key={i} style={{ fontSize: "0.72rem", backgroundColor: "var(--primary-light)", color: "var(--primary)", padding: "0.2rem 0.65rem", borderRadius: "4px", fontWeight: 700 }}>
                  {tag.trim()}
                </span>
              ))}
            </div>

            {/* Content */}
            <div style={{ fontSize: "1.05rem", lineHeight: "1.85", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {/* Share bar */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", marginRight: "0.25rem" }}>
                <Share2 size={14} /> Bagikan:
              </span>

              {/* WhatsApp */}
              <a href={shareWA} target="_blank" rel="noopener noreferrer" title="Bagikan ke WhatsApp" style={sIcon("#25D366")}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>

              {/* X (Twitter) */}
              <a href={shareX} target="_blank" rel="noopener noreferrer" title="Bagikan ke X" style={sIcon("#000")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>

              {/* Email */}
              <a href={shareEmail} title="Bagikan via Email" style={sIcon("#6366f1")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
              </a>

              {/* Salin URL */}
              <button onClick={copyUrl} title={copied ? "Disalin!" : "Salin URL"} style={{ ...sIcon(copied ? "#059669" : "#64748b"), border: "none", cursor: "pointer", position: "relative" }}>
                {copied
                  ? <Check size={15} color="white" />
                  : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </button>

              {copied && (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>Disalin!</span>
              )}
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem" }}>Artikel Terkait</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {related.map(r => (
                    <Link key={r.id} href={`/berita/${r.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ""}
                      >
                        <img src={r.imageUrl} alt={r.title} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                        <div style={{ padding: "0.75rem" }}>
                          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35, margin: "0 0 0.3rem" }}>
                            {r.title.length > 60 ? r.title.slice(0, 60) + "…" : r.title}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0 }}>
                            {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>

          {/* Sidebar */}
          <aside style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "96px", alignSelf: "flex-start" }}>
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem" }}>
                Berita Terbaru Lainnya
              </h3>
              {recentPosts.length === 0
                ? <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Belum ada berita lain.</p>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {recentPosts.map(r => (
                      <Link key={r.id} href={`/berita/${r.id}`} style={{ display: "flex", gap: "0.75rem", textDecoration: "none" }}>
                        <img src={r.imageUrl} alt={r.title} style={{ width: "68px", height: "56px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35, margin: "0 0 0.25rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                            onMouseOver={e => (e.currentTarget as HTMLElement).style.color = "var(--primary)"}
                            onMouseOut={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
                          >
                            {r.title}
                          </p>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                            {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              }
            </div>

            {/* Peta promo */}
            <div className="card" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", color: "white", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Peta Wisata Interaktif</h4>
              <p style={{ color: "#d1fae5", fontSize: "0.82rem", lineHeight: 1.55, margin: 0 }}>
                Temukan lokasi wisata, hotel, dan kuliner di seluruh Lampung Timur lewat peta interaktif kami.
              </p>
              <Link href="/peta" style={{ display: "inline-block", padding: "0.6rem 1.25rem", background: "white", color: "#065f46", fontWeight: 700, borderRadius: "10px", fontSize: "0.82rem", textAlign: "center", textDecoration: "none" }}>
                Buka Peta Wisata
              </Link>
            </div>

            {/* Back link */}
            <Link href="/berita" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "white", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              <ArrowLeft size={14} /> Semua Berita
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function sIcon(bg: string): React.CSSProperties {
  return {
    width: "36px", height: "36px", borderRadius: "50%",
    backgroundColor: bg, display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    textDecoration: "none", flexShrink: 0,
    transition: "opacity 0.15s, transform 0.15s",
  };
}
