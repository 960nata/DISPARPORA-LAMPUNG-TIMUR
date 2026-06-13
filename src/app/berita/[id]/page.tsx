"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ArrowLeft, BookOpen, Clock, Tag, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

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
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch all posts to find our matching item, and populate recent posts sidebar
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const matched = data.find((p: Post) => p.id === id);
          if (matched) {
            setPost(matched);
          }
          
          // Populate recent (excluding current)
          const otherPublished = data
            .filter((p: Post) => p.status === "published" && p.id !== id)
            .slice(0, 4);
          setRecentPosts(otherPublished);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: "0.5rem" }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
        <span>Memuat artikel...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Artikel Tidak Ditemukan</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Maaf, berita yang Anda cari tidak tersedia atau sudah dihapus.
        </p>
        <button onClick={() => router.push("/berita")} className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Kembali ke Portal Berita
        </button>
      </div>
    );
  }

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Split content by newlines into paragraphs
  const paragraphs = post.content.split("\n").filter(p => p.trim());

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      {/* Back button */}
      <button
        onClick={() => router.push("/berita")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "none",
          border: "none",
          color: "var(--primary)",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: "2rem"
        }}
      >
        <ArrowLeft size={16} />
        Kembali ke Portal Berita
      </button>

      {/* Main split layout: Article Content (2/3) and Sidebar (1/3) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
        {/* Article Body */}
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Cover Image */}
          <div style={{ height: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Article Info */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={16} style={{ color: "var(--primary)" }} />
              {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <User size={16} style={{ color: "var(--primary)" }} />
              {post.authorName}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Clock size={16} style={{ color: "var(--primary)" }} />
              {readingTime} menit baca
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, fontFamily: "var(--font-serif)", color: "var(--text-primary)", lineHeight: "1.2" }}>
            {post.title}
          </h1>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
            <Tag size={14} style={{ color: "var(--text-muted)" }} />
            {post.tags.split(",").map((tag, idx) => (
              <span key={idx} style={{
                fontSize: "0.75rem",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                fontWeight: 700
              }}>
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Content Body */}
          <div style={{ fontSize: "1.05rem", lineHeight: "1.8", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </motion.article>

        {/* Sidebar (Recent articles) */}
        <aside style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.25rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem" }}>
              Berita Terbaru Lainnya
            </h3>
            
            {recentPosts.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tidak ada berita terbaru lainnya.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {recentPosts.map((rPost) => (
                  <Link
                    key={rPost.id}
                    href={`/berita/${rPost.id}`}
                    style={{ display: "flex", gap: "0.75rem" }}
                  >
                    <img
                      src={rPost.imageUrl}
                      alt={rPost.title}
                      style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: "1.3" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}>
                        {rPost.title.length > 50 ? `${rPost.title.substring(0, 50)}...` : rPost.title}
                      </h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {new Date(rPost.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick promotion widget */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            color: "white",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700 }}>Peta Wisata Interaktif</h4>
            <p style={{ color: "#d1fae5", fontSize: "0.85rem", lineHeight: "1.5" }}>
              Gunakan peta navigasi kami untuk melacak posisi lokasi wisata di seluruh Lampung Timur dengan mudah.
            </p>
            <Link href="/peta" className="btn btn-accent" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", textAlign: "center" }}>
              Buka Peta Wisata
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
