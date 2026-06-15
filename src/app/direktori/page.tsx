"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Phone, Link2, Eye, Compass, TreePine, Milestone, Landmark, Hotel, Utensils, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div style={{ paddingBottom: "5rem" }}>
      {/* ── HERO ── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
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
              {currentItems.map((item: any, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "340px",
                    position: "relative"
                  }}
                >
                  {/* Card Image */}
                  {(item as any).image && (
                    <div style={{ margin: "-1.5rem -1.5rem 1.25rem -1.5rem", height: "180px", overflow: "hidden", borderRadius: "var(--border-radius) var(--border-radius) 0 0" }}>
                      <img
                        src={(item as any).image}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  <div>
                    {/* Card Header stats */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <span className="badge badge-success" style={{
                        backgroundColor: 
                          item.displayCategory === "Wisata Alam" ? "var(--primary-light)" :
                          item.displayCategory === "Wisata Buatan" ? "var(--accent-light)" :
                          item.displayCategory === "Wisata Budaya" ? "#f3e8ff" :
                          item.displayCategory === "Akomodasi" ? "#dbeafe" : "#fce7f3",
                        color:
                          item.displayCategory === "Wisata Alam" ? "var(--primary)" :
                          item.displayCategory === "Wisata Buatan" ? "var(--accent)" :
                          item.displayCategory === "Wisata Budaya" ? "#8b5cf6" :
                          item.displayCategory === "Akomodasi" ? "#2563eb" : "#db2777"
                      }}>
                        {item.displayCategory}
                      </span>
                      {item.hasOwnProperty("active") && (
                        <span className={`badge ${item.active ? "badge-success" : "badge-danger"}`}>
                          {item.active ? "Aktif" : "Non-Aktif"}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                      {item.name || "(Destinasi Tanpa Nama)"}
                    </h3>

                    {/* Address details */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                      <MapPin size={16} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                        {item.address || "Kecamatan " + item.kecamatan + ", Lampung Timur"}
                      </span>
                    </div>

                    {/* Dynamic info depending on type */}
                    {/* Hotel specific */}
                    {item.displayCategory === "Akomodasi" && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.75rem 0", padding: "0.5rem", backgroundColor: "var(--bg-primary)", borderRadius: "8px" }}>
                        <div><strong>Klasifikasi:</strong> {item.classification}</div>
                        <div><strong>Kapasitas Kamar:</strong> {item.rooms} Kamar</div>
                      </div>
                    )}

                    {/* Culinary specific */}
                    {item.displayCategory === "Kuliner" && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.75rem 0", padding: "0.5rem", backgroundColor: "var(--bg-primary)", borderRadius: "8px" }}>
                        <div><strong>Jenis Kuliner:</strong> {item.food_type}</div>
                        <div><strong>Kapasitas Kursi/Meja:</strong> {item.capacity} Kursi</div>
                      </div>
                    )}

                    {/* Facilities specific */}
                    {(item as any).facilities && (item as any).facilities.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Fasilitas Pendukung:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                          {(item as any).facilities.slice(0, 4).map((fac: string, idx: number) => (
                            <span key={idx} style={{
                              fontSize: "0.7rem",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-secondary)",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                              border: "1px solid var(--border)"
                            }}>
                              {fac}
                            </span>
                          ))}
                          {(item as any).facilities.length > 4 && (
                            <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 700 }}>
                              +{(item as any).facilities.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1.25rem" }}>
                    {item.map_link ? (
                      <a
                        href={item.map_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: "0.5rem", flex: 1, fontSize: "0.8rem", display: "flex", gap: "0.25rem" }}
                      >
                        <Link2 size={14} />
                        Google Maps
                      </a>
                    ) : (
                      <div
                        style={{ padding: "0.5rem", flex: 1, fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "0.25rem", justifyContent: "center", alignItems: "center", border: "1px dashed var(--border)", borderRadius: "8px" }}
                      >
                        No Map Link
                      </div>
                    )}
                    
                    {/* Only tourism categories have coordinates set */}
                    {item.lat && item.lng && (
                      <Link
                        href={`/peta?id=${item.id}`}
                        className="btn btn-primary"
                        style={{ padding: "0.5rem", flex: 1, fontSize: "0.8rem", display: "flex", gap: "0.25rem" }}
                      >
                        <Eye size={14} />
                        Peta Wisata
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
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
