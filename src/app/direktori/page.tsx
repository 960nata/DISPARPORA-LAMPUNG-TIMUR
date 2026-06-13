"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Phone, Link2, Eye, Compass, TreePine, Milestone, Landmark, Hotel, Utensils, Sparkles } from "lucide-react";
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
  const [activeOnly, setActiveOnly] = useState(false);
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

    // 4. Active Status Match
    const matchesActive = !activeOnly || item.active === true;

    return matchesSearch && matchesCategory && matchesKecamatan && matchesActive;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedKecamatan, activeOnly]);

  const categories = [
    { name: "Semua", icon: <Compass size={16} /> },
    { name: "Wisata Alam", icon: <TreePine size={16} /> },
    { name: "Wisata Buatan", icon: <Milestone size={16} /> },
    { name: "Wisata Budaya", icon: <Landmark size={16} /> },
    { name: "Akomodasi", icon: <Hotel size={16} /> },
    { name: "Kuliner", icon: <Utensils size={16} /> }
  ];

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}>Direktori Destinasi Lampung Timur</h2>
        <div style={{ width: "80px", height: "4px", backgroundColor: "var(--primary)", margin: "1rem auto 1.5rem auto", borderRadius: "2px" }} />
        <p style={{ maxWidth: "600px", margin: "0 auto" }}>
          Temukan destinasi liburan, hotel penginapan, dan tempat kuliner seruit Lampung terbaik di seluruh kecamatan Lampung Timur.
        </p>
      </div>

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

          {/* Toggle Active Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "180px" }}>
            <input
              type="checkbox"
              id="activeOnly"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
            <label htmlFor="activeOnly" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
              Tampilkan Hanya yang Aktif
            </label>
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem"
        }}>
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
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Selanjutnya
          </button>
        </div>
      )}
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
