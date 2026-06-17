"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, Search, TreePine, Milestone, Landmark, Hotel, Utensils,
  Compass, RefreshCw, ArrowRight,
} from "lucide-react";

interface Destination {
  id: string; name: string; category: string; kecamatan: string;
  address: string; active: boolean; facilities?: string;
  contact?: string; classification?: string; rooms?: number;
  imageUrl?: string; description?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

const CATS = ["Semua", "Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"];

const CAT_COLOR: Record<string, string> = {
  "Wisata Alam":   "#059669",
  "Wisata Buatan": "#d97706",
  "Wisata Budaya": "#8b5cf6",
  "Akomodasi":     "#3b82f6",
  "Kuliner":       "#ec4899",
};
const CAT_BG: Record<string, string> = {
  "Wisata Alam":   "#ecfdf5",
  "Wisata Buatan": "#fffbeb",
  "Wisata Budaya": "#f5f3ff",
  "Akomodasi":     "#eff6ff",
  "Kuliner":       "#fdf2f8",
};
const CAT_ICON: Record<string, React.ReactNode> = {
  "Wisata Alam":   <TreePine size={14} />,
  "Wisata Buatan": <Milestone size={14} />,
  "Wisata Budaya": <Landmark size={14} />,
  "Akomodasi":     <Hotel size={14} />,
  "Kuliner":       <Utensils size={14} />,
};

export default function DestinasiPublicPage() {
  const [items, setItems]     = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("Semua");

  useEffect(() => {
    fetch("/api/destinations")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setItems(d); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(d => {
    const active = d.active !== false;
    const matchCat = cat === "Semua" || d.category === cat;
    const matchQ = d.name.toLowerCase().includes(search.toLowerCase()) ||
                   d.kecamatan.toLowerCase().includes(search.toLowerCase());
    return active && matchCat && matchQ;
  });

  return (
    <div style={{ paddingBottom: "5rem" }}>

      {/* ── Hero ── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "2.5rem" }}>
        <div style={{
          backgroundImage: "linear-gradient(to right,rgba(5,46,35,0.95) 0%,rgba(6,78,59,0.78) 55%,rgba(6,78,59,0.18) 100%), url('/Gallery/hero1.avif')",
          backgroundSize: "cover", backgroundPosition: "center",
          borderRadius: "24px", overflow: "hidden", position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4.5rem", paddingBottom: "3.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px", padding: "0.3rem 1rem", fontSize: "0.75rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
              <Compass size={13} /> Destinasi Wisata
            </div>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.85rem)", fontWeight: 900, color: "white", lineHeight: 1.15, margin: "0 0 0.75rem", letterSpacing: "-0.02em", maxWidth: "640px" }}>
              Jelajahi Destinasi Wisata Lampung Timur
            </h1>
            <p style={{ color: "#a7f3d0", fontSize: "1rem", margin: "0 0 2rem", maxWidth: "520px", lineHeight: 1.6 }}>
              Temukan keindahan alam, budaya, dan kuliner terbaik di Kabupaten Lampung Timur.
            </p>

            {/* Search bar */}
            <div style={{ position: "relative", maxWidth: "480px" }}>
              <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari destinasi atau kecamatan..."
                style={{ width: "100%", boxSizing: "border-box", padding: "0.85rem 1rem 0.85rem 2.75rem", borderRadius: "14px", border: "none", background: "rgba(255,255,255,0.95)", fontSize: "0.9rem", color: "#0f172a", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container">

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700,
              cursor: "pointer", border: `1px solid ${cat === c ? (CAT_COLOR[c] ?? "var(--primary)") : "var(--border)"}`,
              background: cat === c ? (CAT_BG[c] ?? "var(--primary-light)") : "white",
              color: cat === c ? (CAT_COLOR[c] ?? "var(--primary)") : "var(--text-secondary)",
              transition: "all 0.15s",
            }}>
              {CAT_ICON[c]} {c}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Menampilkan <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> destinasi
            {cat !== "Semua" && <> kategori <strong style={{ color: CAT_COLOR[cat] }}>{cat}</strong></>}
            {search && <> dengan kata kunci "<strong>{search}</strong>"</>}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh", gap: "0.65rem", color: "var(--text-secondary)" }}>
            <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
            Memuat destinasi...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--text-secondary)" }}>
            <Compass size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
            <p style={{ fontSize: "1rem", fontWeight: 700 }}>Tidak ada destinasi ditemukan.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {filtered.map(d => {
              const color = CAT_COLOR[d.category] ?? "#059669";
              const bg    = CAT_BG[d.category]    ?? "#ecfdf5";
              const icon  = CAT_ICON[d.category];
              const facs  = d.facilities ? d.facilities.split(",").map(f => f.trim()).filter(Boolean) : [];
              return (
                <Link key={d.id} href={`/destinasi/${d.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = "translateY(-5px)"; t.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = ""; t.style.boxShadow = "var(--card-shadow)"; }}>

                    {/* Thumbnail / color bar */}
                    {d.imageUrl ? (
                      <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                        <img src={d.imageUrl} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)" }} />
                        <div style={{ position: "absolute", top: "10px", left: "10px", display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(255,255,255,0.9)", color, padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.66rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", backdropFilter: "blur(4px)" }}>
                          {icon} {d.category}
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: "4px", background: color }} />
                    )}

                    <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {/* Category pill (no image case) */}
                      {!d.imageUrl && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: bg, color, padding: "0.2rem 0.7rem", borderRadius: "9999px", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start" }}>
                          {icon} {d.category}
                        </div>
                      )}

                      {/* Name */}
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                        {d.name}
                      </h3>

                      {/* Location */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#64748b", fontSize: "0.82rem" }}>
                        <MapPin size={13} style={{ color, flexShrink: 0 }} /> Kec. {d.kecamatan}
                      </div>

                      {/* Description preview */}
                      {d.description && (
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {stripHtml(d.description)}
                        </p>
                      )}

                      {/* Facilities preview */}
                      {facs.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {facs.slice(0, 3).map((f, i) => (
                            <span key={i} style={{ fontSize: "0.68rem", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "0.15rem 0.55rem", borderRadius: "6px" }}>{f}</span>
                          ))}
                          {facs.length > 3 && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8" }}>+{facs.length - 3}</span>}
                        </div>
                      )}

                      <div style={{ flex: 1 }} />

                      {/* CTA */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", marginTop: "auto" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: d.active ? "#059669" : "#94a3b8" }}>
                          {d.active ? "● Beroperasi" : "● Tutup"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", fontWeight: 700, color }}>
                          Lihat Detail <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
