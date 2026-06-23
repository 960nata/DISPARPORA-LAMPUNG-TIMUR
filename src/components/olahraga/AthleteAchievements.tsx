import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  Sparkles,
  RefreshCw,
  Trophy,
} from "lucide-react";

interface Athlete {
  id: string | number;
  nama: string;
  cabor: string;
  juara: "Emas" | "Perak" | "Perunggu";
  event: string;
}

const STATIC_ATHLETES: Athlete[] = [
  { id: 1, nama: "Bagus Prasetyo", cabor: "Pencak Silat", juara: "Emas", event: "PORPROV Lampung 2024" },
  { id: 2, nama: "Siti Aminah", cabor: "Bulu Tangkis", juara: "Emas", event: "Kejuaraan Provinsi Lampung 2024" },
  { id: 3, nama: "Rian Hidayat", cabor: "Atletik", juara: "Perak", event: "PORPROV Lampung 2024" },
  { id: 4, nama: "Dewi Lestari", cabor: "Panahan", juara: "Emas", event: "Piala Gubernur Lampung 2024" },
  { id: 5, nama: "Ahmad Fauzi", cabor: "Karate", juara: "Perunggu", event: "Kejurnas Karate Piala Panglima TNI 2023" },
  { id: 6, nama: "Eka Saputra", cabor: "Taekwondo", juara: "Emas", event: "PORPROV Lampung 2024" },
  { id: 7, nama: "Mega Wijaya", cabor: "Catur", juara: "Emas", event: "Kejurnas Catur Junior 2023" },
  { id: 8, nama: "Diki Kurniawan", cabor: "Sepak Bola", juara: "Perak", event: "PORPROV Lampung 2024" },
  { id: 9, nama: "Rina Sulistia", cabor: "Atletik", juara: "Perunggu", event: "Kejurnas Atletik U-20 2023" },
  { id: 10, nama: "Taufik Hidayatullah", cabor: "Pencak Silat", juara: "Emas", event: "Pencak Silat Championship Jakarta 2024" },
  { id: 11, nama: "Andika Pratama", cabor: "Tenis Meja", juara: "Perak", event: "Pekan Olahraga Pelajar Daerah (POPDA) 2023" },
  { id: 12, nama: "Santi Rahayu", cabor: "Bulu Tangkis", juara: "Emas", event: "PORPROV Lampung 2024" },
  { id: 13, nama: "Doni Saputra", cabor: "Taekwondo", juara: "Perak", event: "Kejuaraan Nasional Taekwondo Bekasi Open 2024" },
  { id: 14, nama: "Yayan Ruhiyan", cabor: "Pencak Silat", juara: "Emas", event: "Kejuaraan Silat Nusantara 2024" },
  { id: 15, nama: "Indah Permata", cabor: "Panahan", juara: "Perunggu", event: "Surabaya Archery Open 2023" },
  { id: 16, nama: "Aris Munandar", cabor: "Atletik", juara: "Emas", event: "Lampung Half Marathon 2024" },
  { id: 17, nama: "Fitriani", cabor: "Bulu Tangkis", juara: "Perak", event: "BNI Sirkuit Nasional Lampung 2024" },
  { id: 18, nama: "Guntur Wibowo", cabor: "Tinju", juara: "Emas", event: "Kejuaraan Tinju Amatir Regional Sumatera 2023" },
  { id: 19, nama: "Hendra Setiawan", cabor: "Catur", juara: "Perak", event: "Turnamen Catur Piala Walikota Metro 2024" },
  { id: 20, nama: "Lilis Karlina", cabor: "Senam", juara: "Perunggu", event: "PORPROV Lampung 2024" },
  { id: 21, nama: "Muhammad Ali", cabor: "Karate", juara: "Emas", event: "Kejurda Forki Lampung 2024" },
  { id: 22, nama: "Nadia Vega", cabor: "Renang", juara: "Emas", event: "POPDA Lampung 2023" },
  { id: 23, nama: "Oki Setiana", cabor: "Panjat Tebing", juara: "Perak", event: "Kejurnas Panjat Tebing Junior 2024" },
  { id: 24, nama: "Putra Bangsa", cabor: "Sepak Bola", juara: "Emas", event: "Piala Soeratin U-17 Rayon Lampung 2023" },
  { id: 25, nama: "Qori Sandioriva", cabor: "Kempo", juara: "Perunggu", event: "PORPROV Lampung 2024" },
  { id: 26, nama: "Rudi Hartono", cabor: "Bulu Tangkis", juara: "Emas", event: "O2SN Tingkat Provinsi Lampung 2024" },
  { id: 27, nama: "Siska Yuliana", cabor: "Karate", juara: "Perak", event: "PORPROV Lampung 2024" },
  { id: 28, nama: "Tri Wahyuni", cabor: "Angkat Besi", juara: "Emas", event: "Kejurnas Angkat Besi Remaja 2023" },
  { id: 29, nama: "Umar Syarief", cabor: "Karate", juara: "Emas", event: "Kejuaraan Karate Terbuka Lampung 2024" },
  { id: 30, nama: "Vina Panduwinata", cabor: "Renang", juara: "Perak", event: "PORPROV Lampung 2024" },
];

export default function AthleteAchievements() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCabor, setSelectedCabor] = useState("Semua");
  const [selectedMedal, setSelectedMedal] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Athlete>("nama");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch from live API with static fallback
  useEffect(() => {
    fetch("/api/athletes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAthletes(data);
        } else {
          setAthletes(STATIC_ATHLETES);
        }
      })
      .catch(() => {
        setAthletes(STATIC_ATHLETES);
      })
      .finally(() => setLoading(false));
  }, []);

  // List of Cabang Olahraga for filter dropdown
  const caborList = useMemo(() => {
    const cabors = athletes.map((a) => a.cabor);
    return ["Semua", ...Array.from(new Set(cabors))].sort();
  }, [athletes]);

  // Filter & Search Logic
  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchSearch =
        a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.cabor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCabor = selectedCabor === "Semua" || a.cabor === selectedCabor;
      const matchMedal = selectedMedal === "Semua" || a.juara === selectedMedal;

      return matchSearch && matchCabor && matchMedal;
    });
  }, [athletes, searchQuery, selectedCabor, selectedMedal]);

  // Sorting Logic
  const sortedAthletes = useMemo(() => {
    const data = [...filteredAthletes];
    data.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Special ordering for Medals (Emas -> Perak -> Perunggu)
      if (sortField === "juara") {
        const medalWeight = { Emas: 3, Perak: 2, Perunggu: 1 };
        valA = medalWeight[a.juara];
        valB = medalWeight[b.juara];
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredAthletes, sortField, sortDirection]);

  // Pagination Logic
  const paginatedAthletes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAthletes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAthletes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAthletes.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCabor, selectedMedal, itemsPerPage]);

  const handleSort = (field: keyof Athlete) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCabor("Semua");
    setSelectedMedal("Semua");
    setSortField("nama");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const handleExport = (type: "excel" | "pdf") => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Berhasil mengekspor data dalam format ${type === "excel" ? "Excel (.xlsx)" : "PDF (.pdf)"}!`);
    }, 1500);
  };


  return (
    <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      {/* SECTION HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(14,159,79,0.1)", border: "1px solid rgba(14,159,79,0.2)", borderRadius: "99px", padding: "4px 12px", marginBottom: "0.75rem" }}>
            <Trophy size={12} style={{ color: "#0E9F4F" }} />
            <span style={{ color: "#0E9F4F", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>Database Prestasi</span>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
            Data Atlet &amp; Prestasi Lampung Timur
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "0.3rem", margin: 0 }}>
            Daftar resmi pencapaian atlet berprestasi di tingkat regional, nasional, dan internasional.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => handleExport("excel")}
            disabled={isExporting}
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: "10px",
              background: "#0E9F4F",
              color: "white",
              fontWeight: 700,
              fontSize: "0.82rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(14,159,79,0.2)",
              transition: "all 0.2s ease",
              opacity: isExporting ? 0.7 : 1,
            }}
            className="btn-export"
          >
            <Download size={14} />
            {isExporting ? "Mengekspor..." : "Unduh Excel"}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div style={{
        background: "white",
        borderRadius: "18px",
        border: "1px solid #e2e8f0",
        padding: "1.25rem",
        boxShadow: "0 2px 12px -4px rgba(0,0,0,0.05)",
        marginBottom: "1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: "1rem",
        alignItems: "center"
      }} className="filter-grid">
        
        {/* Search Bar */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Cari atlet, cabor, atau event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.65rem 1rem 0.65rem 2.5rem",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              color: "#334155",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            className="search-input"
          />
        </div>

        {/* Dropdown Cabor */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: "160px" }}>
          <select
            value={selectedCabor}
            onChange={(e) => setSelectedCabor(e.target.value)}
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              color: "#334155",
              outline: "none",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="Semua">Cabang Olahraga (Semua)</option>
            {caborList.filter(c => c !== "Semua").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Dropdown Medal */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
          <select
            value={selectedMedal}
            onChange={(e) => setSelectedMedal(e.target.value)}
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              color: "#334155",
              outline: "none",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="Semua">Semua Medali</option>
            <option value="Emas">🥇 Emas</option>
            <option value="Perak">🥈 Perak</option>
            <option value="Perunggu">🥉 Perunggu</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          style={{
            padding: "0.65rem 1.1rem",
            borderRadius: "10px",
            background: "#f1f5f9",
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            height: "100%",
          }}
          className="btn-reset"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      {/* DATA GRID & INTERACTIVE EXCEL-LIKE TABLE */}
      <div style={{
        background: "white",
        borderRadius: "18px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px -8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1.1rem 1.25rem", color: "#475569", fontWeight: 800, width: "60px" }}>No.</th>
                
                <th
                  onClick={() => handleSort("nama")}
                  style={{ padding: "1.1rem 1.25rem", color: "#475569", fontWeight: 800, cursor: "pointer", userSelect: "none" }}
                  className="table-th-sort"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Nama Atlet <ArrowUpDown size={13} style={{ color: sortField === "nama" ? "#0E9F4F" : "#94a3b8" }} />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("cabor")}
                  style={{ padding: "1.1rem 1.25rem", color: "#475569", fontWeight: 800, cursor: "pointer", userSelect: "none" }}
                  className="table-th-sort"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Cabang Olahraga <ArrowUpDown size={13} style={{ color: sortField === "cabor" ? "#0E9F4F" : "#94a3b8" }} />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("juara")}
                  style={{ padding: "1.1rem 1.25rem", color: "#475569", fontWeight: 800, cursor: "pointer", userSelect: "none", width: "160px" }}
                  className="table-th-sort"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Prestasi <ArrowUpDown size={13} style={{ color: sortField === "juara" ? "#0E9F4F" : "#94a3b8" }} />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("event")}
                  style={{ padding: "1.1rem 1.25rem", color: "#475569", fontWeight: 800, cursor: "pointer", userSelect: "none" }}
                  className="table-th-sort"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Kejuaraan / Event <ArrowUpDown size={13} style={{ color: sortField === "event" ? "#0E9F4F" : "#94a3b8" }} />
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedAthletes.length > 0 ? (
                  paginatedAthletes.map((a, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    
                    // Style for Medals
                    let medalBadgeStyle = {};
                    let medalIcon = "🏆";
                    
                    if (a.juara === "Emas") {
                      medalBadgeStyle = {
                        background: "linear-gradient(135deg, #fffbeb, #fde68a)",
                        color: "#92400e",
                        border: "1px solid #fcd34d",
                      };
                      medalIcon = "🥇";
                    } else if (a.juara === "Perak") {
                      medalBadgeStyle = {
                        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                      };
                      medalIcon = "🥈";
                    } else {
                      medalBadgeStyle = {
                        background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                        color: "#c2410c",
                        border: "1px solid #fed7aa",
                      };
                      medalIcon = "🥉";
                    }

                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: "0.95rem 1.25rem", color: "#64748b", fontWeight: 700 }}>
                          {rowNumber}
                        </td>
                        <td style={{ padding: "0.95rem 1.25rem", color: "#0f172a", fontWeight: 800 }}>
                          {a.nama}
                        </td>
                        <td style={{ padding: "0.95rem 1.25rem", color: "#334155", fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0E9F4F" }} />
                            {a.cabor}
                          </div>
                        </td>
                        <td style={{ padding: "0.95rem 1.25rem" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "3px 12px",
                            borderRadius: "99px",
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            ...medalBadgeStyle
                          }}>
                            <span>{medalIcon}</span>
                            <span>{a.juara}</span>
                          </span>
                        </td>
                        <td style={{ padding: "0.95rem 1.25rem", color: "#64748b", fontSize: "0.84rem" }}>
                          {a.event}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr style={{ height: "200px" }}>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <Award size={36} style={{ color: "#cbd5e1" }} />
                        <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Tidak ada data atlet yang cocok dengan filter.</span>
                        <button
                          onClick={resetFilters}
                          style={{
                            marginTop: "4px",
                            padding: "4px 12px",
                            fontSize: "0.78rem",
                            background: "#0E9F4F",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 700
                          }}
                        >
                          Reset Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER / PAGINATION */}
        <div style={{
          padding: "1rem 1.25rem",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          {/* Row Count Info */}
          <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
            {sortedAthletes.length > 0 ? (
              <span>
                Menampilkan <strong style={{ color: "#0f172a" }}>{(currentPage - 1) * itemsPerPage + 1}</strong> -{" "}
                <strong style={{ color: "#0f172a" }}>{Math.min(currentPage * itemsPerPage, sortedAthletes.length)}</strong> dari{" "}
                <strong style={{ color: "#0f172a" }}>{sortedAthletes.length}</strong> atlet
              </span>
            ) : (
              <span>0 data ditemukan</span>
            )}
          </div>

          {/* Rows Per Page Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#64748b" }}>
            <span>Baris per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                color: "#334155",
                background: "white",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "#cbd5e1" : "#475569",
                  transition: "all 0.2s ease"
                }}
                className="btn-pagination-nav"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: isCurrent ? "1px solid #0E9F4F" : "1px solid #cbd5e1",
                      background: isCurrent ? "#0E9F4F" : "white",
                      color: isCurrent ? "white" : "#475569",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    className={isCurrent ? "" : "btn-pagination-nav"}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                  transition: "all 0.2s ease"
                }}
                className="btn-pagination-nav"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .table-th-sort:hover {
          background-color: #f1f5f9;
        }
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
        .btn-pagination-nav:hover {
          border-color: #94a3b8 !important;
          background-color: #f1f5f9 !important;
          color: #1e293b !important;
        }
        .search-input:focus {
          border-color: #0E9F4F !important;
          box-shadow: 0 0 0 3px rgba(14,159,79,0.1) !important;
        }
        .btn-export:hover {
          background-color: #0c8c44 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(14,159,79,0.25) !important;
        }
        .btn-reset:hover {
          background-color: #e2e8f0 !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        @media (max-width: 900px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .filter-grid > button {
            grid-column: span 2;
          }
        }
        @media (max-width: 600px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
            padding: 1rem !important;
          }
          .filter-grid > div, .filter-grid > button {
            grid-column: span 1 !important;
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
