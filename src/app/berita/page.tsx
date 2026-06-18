"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  RefreshCw,
  TrendingUp,
  Eye,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

/* ── category colour map ── */
const categoryMeta: Record<string, { label: string; color: string; bg: string }> = {
  Pariwisata:    { label: "Pariwisata",       color: "#059669", bg: "rgba(5,150,105,.12)" },
  Kepemudaan:    { label: "Kepemudaan",       color: "#0e7490", bg: "rgba(14,116,144,.12)" },
  Olahraga:      { label: "Keolahragaan",     color: "#b45309", bg: "rgba(245,158,11,.16)" },
  Ekraf:         { label: "Ekonomi Kreatif",   color: "#4d7c0f", bg: "rgba(132,204,22,.18)" },
  Kuliner:       { label: "Kuliner",           color: "#c2410c", bg: "rgba(249,115,22,.14)" },
  Sejarah:       { label: "Sejarah",           color: "#7c3aed", bg: "rgba(124,58,237,.12)" },
  Budaya:        { label: "Budaya",            color: "#a21caf", bg: "rgba(162,28,175,.12)" },
  Infrastruktur: { label: "Infrastruktur",     color: "#0369a1", bg: "rgba(3,105,161,.12)" },
  Konservasi:    { label: "Konservasi",        color: "#15803d", bg: "rgba(21,128,61,.14)" },
  Umum:          { label: "Umum",              color: "#475569", bg: "rgba(71,85,105,.10)" },
};
function getCatMeta(tag: string) {
  const key = Object.keys(categoryMeta).find((k) => tag.toLowerCase().includes(k.toLowerCase()));
  return key ? categoryMeta[key] : { label: tag, color: "#059669", bg: "rgba(5,150,105,.12)" };
}

/* ── static upcoming events ── */
const upcomingEvents = [
  { day: "21", mon: "JUN", title: "Lomba Desa Wisata Tingkat Kabupaten", place: "Aula DISPARPORA" },
  { day: "28", mon: "JUN", title: "Kejuaraan Atletik Pelajar Lampung Timur", place: "Stadion Sukadana" },
  { day: "05", mon: "JUL", title: "Pelatihan Sertifikasi Halal UMKM", place: "Gedung Serbaguna" },
];

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchWithRetry("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news posts:", err);
        setLoading(false);
      });
  }, []);

  /* ── Extract all unique tags ── */
  const allTags = useMemo(() => {
    const tags = ["Semua"];
    posts.forEach((post) => {
      post.tags.split(",").forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      });
    });
    return tags;
  }, [posts]);

  /* ── Filter logic ── */
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.toLowerCase().includes(search.toLowerCase());
      const matchesTag =
        selectedTag === "Semua" ||
        post.tags.split(",").map((t) => t.trim()).includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [posts, search, selectedTag]);

  /* ── Pagination ── */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedTag]);

  /* ── Derived data: featured post (first), side 3, rest ── */
  const featuredPost = currentPosts.length > 0 ? currentPosts[0] : null;
  const sidePosts = currentPosts.slice(1, 4);
  const remainingPosts = currentPosts.slice(4);

  /* ── Trending: top 5 by newest (simple proxy for "trending") ── */
  const trendingPosts = useMemo(() => {
    return posts.slice(0, 5).map((p, i) => ({
      rank: String(i + 1),
      title: p.title.length > 55 ? p.title.substring(0, 55) + "…" : p.title,
      id: p.id,
    }));
  }, [posts]);

  /* ── Popular tags from posts ── */
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach((p) => {
      p.tags.split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) tagCount[trimmed] = (tagCount[trimmed] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label]) => label);
  }, [posts]);

  /* ── tag helper ── */
  const getTag = (post: Post) => {
    const rawTag = post.tags ? post.tags.split(",")[0].trim() : "BERITA";
    return rawTag.toUpperCase();
  };

  /* ── format date helper ── */
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const readTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* ══════════ HERO (PRESERVED) ══════════ */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
        <div
          className="page-hero-inner"
          style={{
            position: "relative",
            backgroundImage:
              "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/5.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "flex",
            alignItems: "center",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              pointerEvents: "none",
            }}
          />
          <div
            className="container"
            style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}
          >
            <h1
              style={{
                fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.25,
                maxWidth: "580px",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 12px rgba(0,0,0,0.25)",
                margin: "0 0 1.25rem 0",
              }}
            >
              Portal Berita Pariwisata
            </h1>
            <p
              style={{
                fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
                color: "#d1fae5",
                maxWidth: "700px",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Ikuti liputan terkini seputar agenda pariwisata, pengumuman resmi kedinasan, jadwal event
              budaya, kisah destinasi unggulan, pembinaan kepemudaan dan olahraga, serta eksplorasi potensi
              desa wisata di seluruh penjuru Kabupaten Lampung Timur.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ SEARCH & FILTER (PRESERVED) ══════════ */}
      <div className="container" style={{ minHeight: "60vh" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {/* Search bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: "1 1 300px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0.6rem 1rem",
                backgroundColor: "var(--bg-primary)",
              }}
            >
              <Search size={18} style={{ color: "var(--text-secondary)", marginRight: "0.5rem" }} />
              <input
                type="text"
                placeholder="Cari judul berita, isi artikel, atau topik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Tags Filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginRight: "0.25rem" }}>
                Filter Topik:
              </span>
              {allTags.slice(0, 8).map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: "0.35rem 0.85rem",
                      borderRadius: "99px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: isSelected ? "1px solid transparent" : "1px solid var(--border)",
                      backgroundColor: isSelected ? "var(--primary)" : "white",
                      color: isSelected ? "white" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════ MAIN CONTENT ══════════ */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0", gap: "0.5rem" }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
            <span>Memuat berita...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "white", borderRadius: "20px" }}>
            <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 700 }}>Belum Ada Berita</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Tidak ada artikel yang sesuai dengan topik atau pencarian Anda saat ini.
            </p>
          </div>
        ) : (
          <>
            {/* ── Two-column layout: articles left, sidebar right ── */}
            <div className="berita-layout">
              {/* ═══ LEFT COLUMN: ARTICLES ═══ */}
              <div>
                {/* ── FEATURED ARTICLE (NewsSection overlay style) ── */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link href={`/berita/${featuredPost.id}`} style={{ textDecoration: "none" }}>
                      <div className="news-featured-card berita-hero-featured">
                        <img
                          src={featuredPost.imageUrl}
                          alt={featuredPost.title}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            zIndex: 1,
                          }}
                        />
                        <div className="news-featured-overlay" />
                        <div className="news-featured-content">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)",
                              border: "1px solid rgba(5, 150, 105, 0.15)",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "6px",
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              letterSpacing: "0.05em",
                            }}>
                              {getTag(featuredPost)}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 500 }}>
                              {fmtDate(featuredPost.createdAt)}
                            </span>
                          </div>
                          <h3
                            className="news-featured-title"
                            style={{ transition: "color 0.2s" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "#a7f3d0")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "white")}
                          >
                            {featuredPost.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* ── 3 CARDS HORIZONTAL GRID ── */}
                {sidePosts.length > 0 && (
                  <div className="berita-secondary-grid" style={{ marginTop: "24px" }}>
                    {sidePosts.map((post, index) => {
                      const cat = getCatMeta(post.tags.split(",")[0]?.trim());
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.08 }}
                        >
                          <Link href={`/berita/${post.id}`} style={{ textDecoration: "none" }}>
                            <article className="berita-secondary-card">
                              <div style={{ position: "relative", height: "142px", background: "#e8f0ea", overflow: "hidden" }}>
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                                />
                                <span
                                  className="berita-cat-badge"
                                  style={{ background: cat.bg, color: cat.color }}
                                >
                                  {cat.label}
                                </span>
                              </div>
                              <div style={{ padding: "16px 17px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                                <div style={{ fontSize: "0.72rem", color: "#8a988e", fontWeight: 600 }}>
                                  {fmtDate(post.createdAt)}
                                </div>
                                <h3 className="berita-secondary-title">{post.title}</h3>
                                <span className="berita-small-link">
                                  Selengkapnya
                                  <ArrowRight size={12} />
                                </span>
                              </div>
                            </article>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* ── REMAINING ARTICLES (if any in current page) ── */}
                {remainingPosts.length > 0 && (
                  <div className="berita-remaining-grid">
                    <AnimatePresence mode="popLayout">
                      {remainingPosts.map((post, index) => {
                        const cat = getCatMeta(post.tags.split(",")[0]?.trim());
                        return (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                          >
                            <Link href={`/berita/${post.id}`} style={{ textDecoration: "none" }}>
                              <article className="berita-secondary-card">
                                <div style={{ position: "relative", height: "142px", background: "#e8f0ea", overflow: "hidden" }}>
                                  <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                                  />
                                  <span
                                    className="berita-cat-badge"
                                    style={{ background: cat.bg, color: cat.color }}
                                  >
                                    {cat.label}
                                  </span>
                                </div>
                                <div style={{ padding: "16px 17px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                                  <div style={{ fontSize: "0.72rem", color: "#8a988e", fontWeight: 600 }}>
                                    {fmtDate(post.createdAt)}
                                  </div>
                                  <h3 className="berita-secondary-title">{post.title}</h3>
                                  <span className="berita-small-link">
                                    Selengkapnya
                                    <ArrowRight size={12} />
                                  </span>
                                </div>
                              </article>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* ═══ RIGHT SIDEBAR ═══ */}
              <aside className="berita-sidebar">
                {/* ── TRENDING ── */}
                <div className="berita-sidebar-card">
                  <div className="berita-sidebar-heading">
                    <TrendingUp size={18} style={{ color: "var(--primary)" }} />
                    Trending
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "17px", marginTop: "18px" }}>
                    {trendingPosts.length > 0 ? (
                      trendingPosts.map((t) => (
                        <Link
                          key={t.id}
                          href={`/berita/${t.id}`}
                          style={{ display: "flex", gap: "14px", alignItems: "flex-start", textDecoration: "none" }}
                        >
                          <span className="berita-trending-rank">{t.rank}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "0.84rem", lineHeight: 1.4, fontWeight: 700, color: "var(--text-primary)" }}>
                              {t.title}
                            </div>
                            <div
                              style={{
                                marginTop: "5px",
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                fontSize: "0.72rem",
                                color: "#8a988e",
                                fontWeight: 600,
                              }}
                            >
                              <Eye size={12} />
                              Populer
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Belum ada data trending.</span>
                    )}
                  </div>
                </div>

                {/* ── EVENTS ── */}
                <div className="berita-events-card">
                  <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(190,242,106,.12)" }} />
                  <div className="berita-sidebar-heading" style={{ position: "relative", color: "#fff" }}>
                    <Calendar size={18} style={{ color: "#BEF26A" }} />
                    Event Mendatang
                  </div>
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", marginTop: "18px" }}>
                    {upcomingEvents.map((e, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "14px",
                          alignItems: "center",
                          paddingBottom: "16px",
                          borderBottom: i < upcomingEvents.length - 1 ? "1px solid rgba(255,255,255,.12)" : "none",
                        }}
                      >
                        <div className="berita-event-date">
                          <div style={{ fontSize: "20px", fontWeight: 800, lineHeight: 1, color: "#BEF26A" }}>{e.day}</div>
                          <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: ".05em", color: "rgba(255,255,255,.7)" }}>{e.mon}</div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.84rem", fontWeight: 700, lineHeight: 1.35, color: "#fff" }}>{e.title}</div>
                          <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "rgba(255,255,255,.65)" }}>{e.place}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── POPULAR TAGS (same button style as filter) ── */}
                <div className="berita-sidebar-card">
                  <div className="berita-sidebar-heading">
                    <Tag size={18} style={{ color: "var(--primary)" }} />
                    Tag Populer
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "18px" }}>
                    {popularTags.length > 0 && popularTags.map((tag) => {
                      const isSelected = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => { setSelectedTag(tag); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          style={{
                            padding: "0.35rem 0.85rem",
                            borderRadius: "99px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            border: isSelected ? "1px solid transparent" : "1px solid var(--border)",
                            backgroundColor: isSelected ? "var(--primary)" : "white",
                            color: isSelected ? "white" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>

            {/* ── PAGINATION (Direktori style) ── */}
            {totalPages > 1 && (() => {
              const pages: (number | "...")[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push("...");
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }

              const btnBase: React.CSSProperties = {
                width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
              };

              return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.35rem", marginTop: "3rem" }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ ...btnBase, opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {pages.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} style={{ width: "38px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          ...btnBase,
                          backgroundColor: currentPage === p ? "var(--primary)" : "var(--bg-secondary)",
                          color: currentPage === p ? "white" : "var(--text-primary)",
                          border: currentPage === p ? "1px solid transparent" : "1px solid var(--border)",
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ ...btnBase, opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* ══════════ CALLOUT SECTION ══════════ */}
      <section className="container" style={{ marginTop: "4rem" }}>
        <div className="callout-inner" style={{
          background: "linear-gradient(135deg, #064e3b, #065f46)",
          color: "white",
          borderRadius: "24px",
          padding: "4rem 3rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          boxShadow: "0 20px 25px -5px rgba(5,150,105,0.2)",
        }}>
          <h2 className="section-heading" style={{ fontSize: "2.25rem", color: "white", fontFamily: "var(--font-serif)", fontWeight: 700 }}>
            Ingin Mengunjungi Lampung Timur?
          </h2>
          <p style={{ maxWidth: "650px", color: "#d1fae5" }}>
            Gunakan peta interaktif kami untuk melihat sebaran lokasi wisata alam, cagar budaya, ketersediaan hotel/homestay terdekat, serta pilihan kuliner khas di seluruh kecamatan Kabupaten Lampung Timur.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
            <Link
              href="/peta"
              className="btn cta-btn"
              style={{ padding: "0.85rem 2rem", backgroundColor: "white", color: "#065f46", fontWeight: 700, borderRadius: "12px", border: "none" }}
            >
              Buka Peta Wisata
            </Link>
            <Link
              href="/direktori"
              className="btn cta-btn"
              style={{ padding: "0.85rem 2rem", backgroundColor: "rgba(255,255,255,0.12)", color: "white", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              Lihat Direktori
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
