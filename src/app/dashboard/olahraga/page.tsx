"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Award, Trophy,
  ChevronLeft, ChevronRight, Download, RefreshCw
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";

interface Athlete {
  id: string;
  nama: string;
  cabor: string;
  juara: string;
  event: string;
}

const JUARA_OPTIONS = ["Emas", "Perak", "Perunggu"];
const JUARA_COLORS: Record<string, string> = {
  Emas: "#d97706",      // Amber Gold
  Perak: "#475569",     // Slate Silver
  Perunggu: "#c2410c",  // Orange Bronze
};

export default function OlahragaDashboardPage() {
  const { user } = useAdmin();
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [caborFilter, setCaborFilter] = useState("Semua");
  const [juaraFilter, setJuaraFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nama: "",
    cabor: "",
    juara: "Emas",
    event: "",
  });

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Fetch athletes from API
  useEffect(() => {
    fetch("/api/athletes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAthletes(data);
      })
      .catch(() => toast({ type: "error", title: "Gagal memuat data atlet" }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (!["superadmin", "admin_dinas"].includes(user?.role || "")) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
        <Award size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
        <p>Akses ditolak.</p>
      </div>
    );
  }

  // Get unique Cabang Olahraga list for filters
  const cabors = Array.from(new Set(athletes.map((a) => a.cabor))).sort();

  // Filters & Search
  const filtered = athletes.filter((a) => {
    const matchSearch =
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.event.toLowerCase().includes(search.toLowerCase()) ||
      a.cabor.toLowerCase().includes(search.toLowerCase());
    
    const matchCabor = caborFilter === "Semua" || a.cabor === caborFilter;
    const matchJuara = juaraFilter === "Semua" || a.juara === juaraFilter;

    return matchSearch && matchCabor && matchJuara;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats calculation
  const totalEmas = athletes.filter((a) => a.juara === "Emas").length;
  const totalPerak = athletes.filter((a) => a.juara === "Perak").length;
  const totalPerunggu = athletes.filter((a) => a.juara === "Perunggu").length;

  const handleOpenCreate = () => {
    setFormData({ id: "", nama: "", cabor: "", juara: "Emas", event: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (a: Athlete) => {
    setFormData({ id: a.id, nama: a.nama, cabor: a.cabor, juara: a.juara, event: a.event });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.cabor || !formData.event) {
      toast({ type: "error", title: "Formulir tidak lengkap", message: "Semua kolom wajib diisi." });
      return;
    }

    setIsSaving(true);
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/athletes/${formData.id}` : "/api/athletes";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan");

      if (isEdit) {
        setAthletes((prev) => prev.map((a) => (a.id === formData.id ? result : a)));
        toast({ type: "success", title: "Berhasil!", message: "Data atlet diperbarui." });
      } else {
        setAthletes((prev) => [result, ...prev]);
        toast({ type: "success", title: "Berhasil!", message: "Atlet baru ditambahkan." });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast({ type: "error", title: "Kesalahan", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/athletes/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");

      setAthletes((prev) => prev.filter((a) => a.id !== deleteConfirm.id));
      toast({ type: "success", title: "Dihapus!", message: `Data ${deleteConfirm.name} berhasil dihapus.` });
    } catch {
      toast({ type: "error", title: "Kesalahan", message: "Gagal menghapus data atlet." });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCaborFilter("Semua");
    setJuaraFilter("Semua");
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Kelola Data</p>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-text)" }}>Atlet &amp; Prestasi</h1>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
            {athletes.length} atlet berprestasi Lampung Timur tercatat di database.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
            <input
              className="dash-input"
              type="text"
              placeholder="Cari atlet, event..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: "32px", width: "180px" }}
            />
          </div>
          <select
            className="dash-input"
            value={caborFilter}
            onChange={(e) => { setCaborFilter(e.target.value); setPage(1); }}
            style={{ width: "160px", cursor: "pointer" }}
          >
            <option value="Semua">Semua Cabor</option>
            {cabors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="dash-input"
            value={juaraFilter}
            onChange={(e) => { setJuaraFilter(e.target.value); setPage(1); }}
            style={{ width: "130px", cursor: "pointer" }}
          >
            <option value="Semua">Semua Medali</option>
            {JUARA_OPTIONS.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="dash-btn"
            style={{ background: "none", border: "1px solid var(--dash-border)", color: "var(--dash-text-soft)", padding: "8px" }}
            title="Reset Filters"
          >
            <RefreshCw size={14} />
          </button>
          <button onClick={handleOpenCreate} className="dash-btn" style={{ padding: "8px 14px" }}>
            <Plus size={14} /> Tambah Atlet
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total Atlet Berprestasi", value: athletes.length, color: "var(--dash-primary)", icon: Award },
          { label: "🥇 Medali Emas", value: totalEmas, color: JUARA_COLORS.Emas, icon: Trophy },
          { label: "🥈 Medali Perak", value: totalPerak, color: JUARA_COLORS.Perak, icon: Trophy },
          { label: "🥉 Medali Perunggu", value: totalPerunggu, color: JUARA_COLORS.Perunggu, icon: Trophy },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="dash-stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dash-text-muted)" }}>{s.label}</span>
                  <h3 style={{ fontSize: "1.5rem", color: "var(--dash-text)", fontWeight: 700, margin: "2px 0 0" }}>{s.value}</h3>
                </div>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: `color-mix(in srgb, ${s.color} 10%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Data */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>No</th>
                <th>Nama Atlet</th>
                <th>Cabang Olahraga</th>
                <th>Prestasi / Medali</th>
                <th>Kejuaraan / Event</th>
                <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Memuat data atlet...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Tidak ada atlet ditemukan.</td></tr>
              ) : paged.map((item, idx) => {
                const no = (page - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr key={item.id}>
                    <td style={{ color: "var(--dash-text-muted)", fontWeight: 600 }}>{no}</td>
                    <td style={{ fontWeight: 600, color: "var(--dash-text)" }}>{item.nama}</td>
                    <td>
                      <span className="dash-badge" style={{ backgroundColor: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", border: "1px solid var(--dash-border)" }}>
                        {item.cabor}
                      </span>
                    </td>
                    <td>
                      <span className="dash-badge" style={{ backgroundColor: `color-mix(in srgb, ${JUARA_COLORS[item.juara]} 10%, transparent)`, color: JUARA_COLORS[item.juara], fontWeight: 800 }}>
                        {item.juara === "Emas" ? "🥇 " : item.juara === "Perak" ? "🥈 " : "🥉 "}
                        {item.juara}
                      </span>
                    </td>
                    <td style={{ color: "var(--dash-text-muted)", fontSize: "0.82rem" }}>{item.event}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-primary)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, name: item.nama })}
                          title="Hapus"
                          style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-danger)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--dash-border)", background: "var(--dash-surface)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>
              Menampilkan {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} atlet
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="dash-btn"
                style={{ background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)", color: page === 1 ? "var(--dash-text-muted)" : "var(--dash-text)", padding: "4px 8px", cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="dash-btn"
                style={{ background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)", color: page === totalPages ? "var(--dash-text-muted)" : "var(--dash-text)", padding: "4px 8px", cursor: page === totalPages ? "not-allowed" : "pointer" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "450px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--dash-border)", paddingBottom: "12px", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, color: "var(--dash-text)", fontWeight: 800, fontSize: "1.1rem" }}>
                {formData.id ? "Edit Data Atlet" : "Tambah Data Atlet"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "6px" }}>NAMA ATLET</label>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Masukkan nama lengkap atlet..."
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "6px" }}>CABANG OLAHRAGA</label>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Misal: Bulu Tangkis, Pencak Silat..."
                  value={formData.cabor}
                  onChange={(e) => setFormData({ ...formData, cabor: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "6px" }}>PRESTASI / MEDALI</label>
                <select
                  className="dash-input"
                  value={formData.juara}
                  onChange={(e) => setFormData({ ...formData, juara: e.target.value })}
                  style={{ cursor: "pointer" }}
                >
                  {JUARA_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "6px" }}>KEJUARAAN / EVENT</label>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Misal: PORPROV Lampung 2024..."
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px", borderTop: "1px solid var(--dash-border)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="dash-btn"
                  style={{ flex: 1, background: "none", border: "1px solid var(--dash-border)", color: "var(--dash-text-soft)" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="dash-btn"
                  style={{ flex: 1 }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: "var(--dash-danger)" }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--dash-text)", fontWeight: 700, fontSize: "0.95rem" }}>Hapus Data Atlet?</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>
                  Data prestasi <strong style={{ color: "var(--dash-text)" }}>{deleteConfirm.name}</strong> akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn" style={{ flex: 1, background: "none", border: "1px solid var(--dash-border)", color: "var(--dash-text-soft)" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn" style={{ flex: 1, backgroundColor: "var(--dash-danger)", color: "white" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
