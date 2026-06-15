"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, ArrowRight, BookOpen, Compass, RefreshCw } from "lucide-react";
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

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchWithRetry("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Only show published articles
          const published = data.filter((p: Post) => p.status === "published");
          setPosts(published);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news posts:", err);
        setLoading(false);
      });
  }, []);

  // Extract all unique tags
  const allTags = ["Semua"];
  posts.forEach((post) => {
    post.tags.split(",").forEach((tag) => {
      const trimmed = tag.trim();
      if (trimmed && !allTags.includes(trimmed)) {
        allTags.push(trimmed);
      }
    });
  });

  // Filter items
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === "Semua" ||
      post.tags.split(",").map((t) => t.trim()).includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTag]);

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* ── HERO ── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
        <div className="page-hero-inner" style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5, 46, 35, 0.95) 0%, rgba(6, 78, 59, 0.75) 55%, rgba(6, 78, 59, 0.2) 100%), url('/Gallery/5.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          borderRadius: "24px",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", fontWeight: 900, color: "white", lineHeight: 1.25, maxWidth: "580px", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.25)", margin: "0 0 1.25rem 0" }}>
              Portal Berita Pariwisata
            </h1>
            <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", color: "#d1fae5", maxWidth: "700px", lineHeight: 1.75, margin: 0 }}>
              Ikuti liputan terkini seputar agenda pariwisata, pengumuman resmi kedinasan, jadwal event budaya, kisah destinasi unggulan, pembinaan kepemudaan dan olahraga, serta eksplorasi potensi desa wisata di seluruh penjuru Kabupaten Lampung Timur.
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ minHeight: "60vh" }}>
      {/* Filter and Search Controls */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        marginBottom: "3rem"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {/* Search bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            flex: "1 1 300px",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "0.6rem 1rem",
            backgroundColor: "var(--bg-primary)"
          }}>
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
                color: "var(--text-primary)"
              }}
            />
          </div>

          {/* Tags Select */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginRight: "0.25rem" }}>Filter Topik:</span>
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
                    transition: "all 0.2s ease"
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles Grid List */}
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
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem"
          }}
        >
          <AnimatePresence mode="popLayout">
            {currentPosts.map((post, index) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
                className="card"
                style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
              >
                <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    backgroundColor: "rgba(5, 150, 105, 0.95)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "99px",
                    fontSize: "0.7rem",
                    color: "white",
                    fontWeight: 700,
                    textTransform: "uppercase"
                  }}>
                    {post.tags.split(",")[0]}
                  </div>
                </div>

                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", flexGrow: 1 }}>
                  {/* Meta data */}
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <User size={14} />
                      {post.authorName}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: "1.4" }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", flexGrow: 1, lineHeight: "1.6" }}>
                    {post.content.substring(0, 140)}...
                  </p>

                  <Link
                    href={`/berita/${post.id}`}
                    className="btn btn-secondary"
                    style={{ width: "100%", marginTop: "1rem", padding: "0.6rem 1rem", fontSize: "0.85rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}
                  >
                    Baca Artikel <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className="btn"
                style={{
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.9rem",
                  backgroundColor: isCurrent ? "var(--primary)" : "var(--bg-secondary)",
                  color: isCurrent ? "white" : "var(--text-primary)",
                  border: isCurrent ? "none" : "1px solid var(--border)",
                  cursor: "pointer"
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Selanjutnya
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
