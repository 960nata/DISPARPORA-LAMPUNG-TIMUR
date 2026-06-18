"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Heart, ChevronRight as ChevronRightIcon, Compass, TreePine, Milestone, Landmark, Hotel, Utensils, ChevronLeft, ChevronRight } from "lucide-react";
import tourismData from "@/data/tourism.json";
import { motion, AnimatePresence } from "framer-motion";

function DirectoryContent() {
  const searchParams = useSearchParams();
  
  // Combine all items into a single searchable array
  const allItems = [
    ...tourismData.wisata_alam.map(i => ({ ...i, displayCategory: "Wisata Alam" })),
    ...tourismData.wisata_buatan.map(i => ({ ...i, displayCategory: "Wisata Buatan" })),
    ...tourismData.wisata_budaya.map(i => ({ ...i, displayCategory: "Wisata Budaya" })),
    ...tourismData.hotels.map(i => ({ ...i, displayCategory: "Akomodasi" })),
    ...tourismData.restaurants.map(i => ({ ...i, displayCategory: "Kuliner" }))
  ];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedKecamatan, setSelectedKecamatan] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Sync search query from URL parameter if it exists
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  // Extract all unique kecamatans for filter dropdown
  const uniqueKecamatans = Array.from(new Set(allItems.map(item => item.kecamatan)))
    .filter(Boolean)
    .sort();

  // Filtering Logic
  const filteredItems = allItems.filter(item => {
    // 1. Search Query Match
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.address.toLowerCase().includes(searchLower) ||
      item.kecamatan.toLowerCase().includes(searchLower) ||
      ((item as any).facilities && (item as any).facilities.some((f: string) => f.toLowerCase().includes(searchLower)));
      
    // 2. Category Match
    const matchesCategory = 
      selectedCategory === "Semua" || 
      item.displayCategory === selectedCategory;

    // 3. Kecamatan Match
    const matchesKecamatan = 
      selectedKecamatan === "Semua" || 
      item.kecamatan === selectedKecamatan;

    return matchesSearch && matchesCategory && matchesKecamatan;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedKecamatan]);

  const categories = [
    { name: "Semua", icon: <Compass size={16} /> },
    { name: "Wisata Alam", icon: <TreePine size={16} /> },
    { name: "Wisata Buatan", icon: <Milestone size={16} /> },
    { name: "Wisata Budaya", icon: <Landmark size={16} /> },
    { name: "Akomodasi", icon: <Hotel size={16} /> },
    { name: "Kuliner", icon: <Utensils size={16} /> }
  ];

  return (
    <div className="direktori-page" style={{ paddingBottom: "5rem" }}>
      <style>{`
        .dir-see-more:hover { background: #f1f5f9 !important; transform: scale(0.98); }
        .dir-see-more:hover > div { transform: translateX(2px); }
        .dir-heart-btn:hover { background: rgba(255,255,255,1) !important; transform: scale(1.1); }
      `}</style>
      {/* ── HERO ── */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
        <div className="page-hero-inner" style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5, 46, 35, 0.95) 0%, rgba(6, 78, 59, 0.75) 55%, rgba(6, 78, 59, 0.2) 100%), url('/Gallery/hero1.avif')",
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
              Direktori Destinasi<br />Lampung Timur
            </h1>
            <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", color: "#d1fae5", maxWidth: "520px", lineHeight: 1.75, margin: 0 }}>
              Temukan destinasi liburan, hotel penginapan, dan tempat kuliner terbaik di seluruh kecamatan Lampung Timur.
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>
      {/* Filters & Search Control Bar */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "var(--card-shadow)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {/* Row 1: Search & Dropdowns */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {/* Search box */}
          <div style={{
            display: "flex",
            alignItems: "center",
            flex: "2 1 300px",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--bg-primary)"
          }}>
            <Search size={20} style={{ color: "var(--text-secondary)", marginRight: "0.75rem" }} />
            <input
              type="text"
              placeholder="Cari destinasi, hotel, fasilitas, atau kecamatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.95rem",
                color: "var(--text-primary)"
              }}
            />
          </div>

          {/* Kecamatan Select */}
          <div style={{ flex: "1 1 200px" }}>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none"
              }}
            >
              <option value="Semua">Kecamatan: Semua</option>
              {uniqueKecamatans.map(kec => (
                <option key={kec} value={kec}>Kecamatan: {kec}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Category Pills + Reset */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          alignItems: "center"
        }}>
          {/* Reset button — shown when any filter is active */}
          {(search || selectedCategory !== "Semua" || selectedKecamatan !== "Semua") && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory("Semua"); setSelectedKecamatan("Semua"); }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "99px", border: "1.5px solid #ef4444", backgroundColor: "#fff1f1", color: "#ef4444", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Hapus Filter
            </button>
          )}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "99px",
                  border: isSelected ? "1px solid transparent" : "1px solid var(--border)",
                  backgroundColor: isSelected ? "var(--primary)" : "var(--bg-secondary)",
                  color: isSelected ? "white" : "var(--text-secondary)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }
                }}
              >
                {cat.icon}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      <div style={{ marginBottom: "3rem" }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "white", borderRadius: "20px" }}>
            <Compass size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 700 }}>Data Tidak Ditemukan</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Cobalah ubah kata kunci pencarian Anda atau atur ulang filter kategori.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem"
            }}
          >
            <AnimatePresence mode="popLayout">
              {currentItems.map((item: any, index) => {
                const isHovered = hoveredId === item.id;
                const catColor =
                  item.displayCategory === "Wisata Alam"    ? "#059669" :
                  item.displayCategory === "Wisata Buatan"  ? "#0891b2" :
                  item.displayCategory === "Wisata Budaya"  ? "#7c3aed" :
                  item.displayCategory === "Akomodasi"      ? "#2563eb" : "#db2777";
                const catBg =
                  item.displayCategory === "Wisata Alam"    ? "rgba(5,150,105,.15)" :
                  item.displayCategory === "Wisata Buatan"  ? "rgba(8,145,178,.15)" :
                  item.displayCategory === "Wisata Budaya"  ? "rgba(124,58,237,.15)" :
                  item.displayCategory === "Akomodasi"      ? "rgba(37,99,235,.15)" : "rgba(219,39,119,.15)";

                const metaItems =
                  item.displayCategory === "Akomodasi" ? [
                    { label: "Klasifikasi", val: item.classification || "-" },
                    { label: "Kamar", val: item.rooms ? `${item.rooms} Kamar` : "-" },
                  ] : item.displayCategory === "Kuliner" ? [
                    { label: "Jenis", val: item.food_type || "-" },
                    { label: "Kapasitas", val: item.capacity ? `${item.capacity} Kursi` : "-" },
                  ] : [
                    { label: "Kategori", val: item.displayCategory },
                    { label: "Kecamatan", val: item.kecamatan },
                  ];

                const desc = item.description || `Destinasi ${item.displayCategory.toLowerCase()} yang menarik di Kecamatan ${item.kecamatan}, Kabupaten Lampung Timur.`;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "relative",
                      borderRadius: "22px",
                      overflow: "hidden",
                      height: "380px",
                      boxShadow: isHovered
                        ? "0 20px 50px -12px rgba(0,0,0,0.35)"
                        : "0 4px 20px -4px rgba(0,0,0,0.12)",
                      transition: "box-shadow 0.35s ease, transform 0.35s ease",
                      transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {/* ── IMAGE ── */}
                    <div style={{
                      position: "absolute",
                      left: isHovered ? 0 : "8px",
                      right: isHovered ? 0 : "8px",
                      top: isHovered ? 0 : "8px",
                      bottom: isHovered ? 0 : "47%",
                      transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
                      borderRadius: isHovered ? "22px" : "16px",
                      overflow: "hidden",
                    }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "/Gallery/hero1.avif"; }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${catColor}33, ${catColor}88)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Compass size={48} style={{ color: catColor, opacity: 0.5 }} />
                        </div>
                      )}

                      {/* Hover gradient overlay */}
                      <div style={{
                        position: "absolute", inset: 0,
                        background: isHovered
                          ? "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)"
                          : "none",
                        transition: "background 0.4s ease",
                      }} />
                    </div>

                    {/* ── HEART BUTTON ── */}
                    <button className="dir-heart-btn" style={{
                      position: "absolute", top: "5%", right: "5%", zIndex: 10,
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      backdropFilter: "blur(6px)", transition: "transform 0.2s ease, background 0.2s ease",
                    }} onClick={e => e.preventDefault()}>
                      <Heart size={16} style={{ color: "#065f46" }} />
                    </button>

                    {/* ── HOVER STATE: overlay content ── */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5,
                      padding: "20px",
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(10px)",
                      transition: "all 0.35s ease",
                      pointerEvents: isHovered ? "auto" : "none",
                    }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "99px",
                        background: catBg, color: catColor,
                        fontSize: "0.7rem", fontWeight: 700, marginBottom: "8px",
                        backdropFilter: "blur(4px)",
                        border: `1px solid ${catColor}40`,
                      }}>{item.displayCategory}</span>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>
                        {item.name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
                        <MapPin size={13} style={{ color: "rgba(255,255,255,0.7)" }} />
                        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)" }}>
                          Kec. {item.kecamatan}, Lampung Timur
                        </span>
                      </div>
                      <Link href={`/destinasi/${item.id}`} className="dir-see-more" style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 16px", borderRadius: "14px",
                        background: "#fff", color: "#0f172a",
                        fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                        transition: "background 0.2s ease, transform 0.2s ease",
                      }}>
                        <span>Lihat Detail</span>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: catColor, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s ease" }}>
                          <ChevronRightIcon size={15} style={{ color: "#fff" }} />
                        </div>
                      </Link>
                    </div>

                    {/* ── NORMAL STATE: white content area ── */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: "43%",
                      background: "#fff",
                      borderRadius: "0 0 22px 22px",
                      padding: "14px 18px 16px",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      opacity: isHovered ? 0 : 1,
                      transition: "opacity 0.2s ease",
                      pointerEvents: isHovered ? "none" : "auto",
                      zIndex: 4,
                    }}>
                      <div>
                        <h3 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                          {item.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                          <MapPin size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Kec. {item.kecamatan}</span>
                        </div>
                        {/* Deskripsi 3 baris */}
                        <p style={{
                          margin: 0, fontSize: "0.76rem", color: "#64748b", lineHeight: 1.55,
                          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>{desc}</p>
                      </div>

                      {/* Meta row + See more */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0", borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "8px" }}>
                        {metaItems.map((m, i) => (
                          <div key={i} style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0f172a" }}>{m.val}</div>
                            <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 500 }}>{m.label}</div>
                          </div>
                        ))}
                        <Link href={`/destinasi/${item.id}`} style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "8px 14px", borderRadius: "12px",
                          background: catColor, color: "#fff",
                          fontWeight: 700, fontSize: "0.8rem", textDecoration: "none",
                          flexShrink: 0, whiteSpace: "nowrap",
                          boxShadow: `0 4px 12px -4px ${catColor}80`,
                        }}>
                          Lihat
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ChevronRightIcon size={12} style={{ color: "#fff" }} />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (() => {
        // Build page number list with ellipsis
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
          color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease"
        };

        return (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.35rem" }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
                    border: currentPage === p ? "1px solid transparent" : "1px solid var(--border)"
                  }}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ ...btnBase, opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        );
      })()}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <p>Memuat Direktori Destinasi...</p>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}
