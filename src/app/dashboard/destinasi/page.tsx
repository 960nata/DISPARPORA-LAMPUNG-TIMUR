"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Search, Edit2, Trash2, MapPin, X, Filter } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { MapSkeleton } from "@/components/Skeleton";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <MapSkeleton /> });

interface TourismItem {
  id: string; name: string; category: string; kecamatan: string; address: string;
  lat: number; lng: number; active: boolean; facilities?: string; contact?: string; map_link?: string;
  classification?: string; rooms?: number;
}

const CATEGORIES = ["Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"];
const KECAMATANS = ["Sukadana","Labuhan Maringgai","Labuhan Ratu","Bandar Sribhawono","Sekampung Udik","Pekalongan","Pasir Sakti","Way Jepara","Mataram Baru","Braja Selebah","Jabung","Batanghari","Metro Kibang","Bumi Agung","Raman Utara","Purbolinggo","Way Bungur"];
const CAT_COLORS: Record<string, string> = { "Wisata Alam": "#059669", "Wisata Buatan": "#d97706", "Wisata Budaya": "#8b5cf6", "Akomodasi": "#3b82f6" };

export default function DestinasiPage() {
  const { user } = useAdmin();
  const [destinations, setDestinations] = useState<TourismItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<TourismItem>>({ name: "", category: "Wisata Alam", kecamatan: "Sukadana", address: "", facilities: "", contact: "", active: true, lat: -5.2514, lng: 105.5451 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/destinations").then(r => r.json()).then(data => { if (Array.isArray(data)) setDestinations(data); }).finally(() => setLoading(false));
  }, []);

  if (!["superadmin", "admin_dinas"].includes(user?.role || "")) {
    return <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}><MapPin size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} /><p>Akses ditolak.</p></div>;
  }

  const filtered = destinations.filter(d => {
    const matchCat = catFilter === "Semua" || d.category === catFilter;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.kecamatan.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setModalMode("add"); setForm({ name: "", category: "Wisata Alam", kecamatan: "Sukadana", address: "", facilities: "", contact: "", active: true, lat: -5.2514, lng: 105.5451 }); setModalOpen(true); };
  const openEdit = (item: TourismItem) => { setModalMode("edit"); setForm({ ...item }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.lat || !form.lng) { alert("Nama dan koordinat wajib diisi!"); return; }
    const isAdd = modalMode === "add";
    const res = await fetch(isAdd ? "/api/destinations" : `/api/destinations/${form.id}`, {
      method: isAdd ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Gagal menyimpan"); return; }
    setDestinations(prev => isAdd ? [data, ...prev] : prev.map(d => d.id === data.id ? data : d));
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/destinations/${deleteConfirm.id}`, { method: "DELETE" });
    setDestinations(prev => prev.filter(d => d.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "white" }}>Manajemen Destinasi</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "0.2rem" }}>Total {destinations.length} objek terdaftar</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "var(--dash-card-2)" }}>
          <Search size={15} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
          <input type="text" placeholder="Cari destinasi..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ border: "none", outline: "none", background: "transparent", color: "white", fontSize: "0.85rem", width: "150px" }} />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ padding: "0.45rem 0.75rem", borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: "var(--dash-card-2)", color: "white", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
          <option value="Semua">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.55rem 1rem" }}>
          <Plus size={16} /> Tambah Destinasi
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {CATEGORIES.map(cat => (
          <div key={cat} className="dash-card" style={{ padding: "1rem 1.25rem", borderLeft: `3px solid ${CAT_COLORS[cat]}` }}>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.7rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>{cat}</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: CAT_COLORS[cat] }}>{destinations.filter(d => d.category === cat).length}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Nama Objek</th>
                <th>Kategori</th>
                <th>Kecamatan</th>
                <th>Koordinat</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}><MapPin size={32} style={{ marginBottom: "0.5rem", opacity: 0.3 }} /><br />Tidak ada data</td></tr>
              ) : paged.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: "white" }}>{item.name}</td>
                  <td>
                    <span className="dash-badge" style={{ backgroundColor: `${CAT_COLORS[item.category]}20`, color: CAT_COLORS[item.category] }}>{item.category}</span>
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>{item.kecamatan}</td>
                  <td style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", fontFamily: "monospace" }}>{item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}</td>
                  <td><span className={`dash-badge ${item.active ? "dash-badge-success" : "dash-badge-danger"}`}>{item.active ? "Aktif" : "Non-Aktif"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                      <button onClick={() => openEdit(item)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.3rem" }}><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm({ id: item.id, name: item.name })} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.3rem" }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderTop: "1px solid var(--dash-border)" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", opacity: page === 1 ? 0.4 : 1 }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", backgroundColor: pg === page ? "var(--dash-primary)" : "transparent", border: "1px solid var(--dash-border)" }}>{pg}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", opacity: page === totalPages ? 0.4 : 1 }}>›</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "860px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", position: "relative" }}>
            <button onClick={() => setModalOpen(false)} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={20} /></button>
            <h3 style={{ margin: "0 0 1.5rem", fontWeight: 800, color: "white" }}>{modalMode === "add" ? "Tambah Destinasi Baru" : "Edit Destinasi"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Nama Objek *</label>
                  <input required className="dash-input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Kategori *</label>
                    <select className="dash-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Kecamatan *</label>
                    <select className="dash-input" value={form.kecamatan} onChange={e => setForm(p => ({ ...p, kecamatan: e.target.value }))}>
                      {KECAMATANS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Alamat</label>
                  <input className="dash-input" value={form.address || ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Latitude *</label>
                    <input required type="number" step="any" className="dash-input" value={form.lat || ""} onChange={e => setForm(p => ({ ...p, lat: Number(e.target.value) }))} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Longitude *</label>
                    <input required type="number" step="any" className="dash-input" value={form.lng || ""} onChange={e => setForm(p => ({ ...p, lng: Number(e.target.value) }))} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", alignItems: "end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Fasilitas (pisahkan koma)</label>
                    <input className="dash-input" placeholder="Gazebo, Mushola, Toilet" value={form.facilities || ""} onChange={e => setForm(p => ({ ...p, facilities: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.25rem" }}>
                    <input type="checkbox" id="destActive" checked={form.active !== false} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "var(--dash-primary)" }} />
                    <label htmlFor="destActive" style={{ fontSize: "0.85rem", color: "white", cursor: "pointer" }}>Aktif</label>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Kontak</label>
                  <input className="dash-input" placeholder="+62..." value={form.contact || ""} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
                </div>
              </div>

              {/* Map Picker */}
              <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", display: "block", marginBottom: "0.5rem" }}>Klik peta untuk atur koordinat</label>
                  <div style={{ height: "280px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                    <MapComponent
                      items={[]}
                      selectedItem={{ id: "picker", name: form.name || "Lokasi", kecamatan: form.kecamatan || "", address: form.address || "", category: form.category || "Wisata Alam", lat: form.lat || -5.2514, lng: form.lng || 105.5451 }}
                      onSelectItem={() => {}}
                      isEditMode={true}
                      onCoordinatesChange={(lat, lng) => setForm(p => ({ ...p, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }))}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                  <button type="submit" className="dash-btn" style={{ flex: 1 }}>Simpan Destinasi</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "400px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Trash2 size={22} style={{ color: "#f87171" }} /></div>
              <div><h4 style={{ margin: "0 0 0.4rem", color: "white", fontWeight: 800 }}>Hapus Destinasi?</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--dash-text-muted)" }}><strong style={{ color: "white" }}>{deleteConfirm.name}</strong> akan dihapus permanen.</p></div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn" style={{ flex: 1, backgroundColor: "#dc2626" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
