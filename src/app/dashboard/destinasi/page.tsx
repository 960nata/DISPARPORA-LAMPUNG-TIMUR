"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Plus, Search, Edit2, Trash2, MapPin, X, 
  Compass, Activity, Globe, Layers 
} from "lucide-react";
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
const CAT_COLORS: Record<string, string> = { "Wisata Alam": "#059669", "Wisata Buatan": "#d97706", "Wisata Budaya": "#6940a5", "Akomodasi": "#0284c7" };
const CAT_ICONS: Record<string, any> = {
  "Wisata Alam": Compass,
  "Wisata Buatan": Activity,
  "Wisata Budaya": Globe,
  "Akomodasi": Layers
};

export default function DestinasiPage() {
  const { user } = useAdmin();
  const [destinations, setDestinations] = useState<TourismItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--dash-text)" }}>Proyek Investasi</h1>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>
            Total {destinations.length} proyek terdaftar.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
            <input className="dash-input" type="text" placeholder="Cari proyek..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: "32px", width: "180px" }} />
          </div>
          <select className="dash-input" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ width: "150px", cursor: "pointer" }}>
            <option value="Semua">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openAdd} className="dash-btn" style={{ padding: "8px 14px" }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {CATEGORIES.map(cat => {
          const Icon = CAT_ICONS[cat];
          const color = CAT_COLORS[cat];
          const count = destinations.filter(d => d.category === cat).length;
          return (
            <div key={cat} className="dash-stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dash-text-muted)" }}>{cat}</span>
                  <h3 style={{ fontSize: "1.5rem", color: "var(--dash-text)", fontWeight: 700, margin: "2px 0 0" }}>{count}</h3>
                </div>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nama Objek</th>
                <th>Kategori</th>
                <th>Kecamatan</th>
                <th>Koordinat</th>
                <th>Status</th>
                <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Memuat data...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Tidak ada proyek ditemukan.</td></tr>
              ) : paged.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: "var(--dash-text)" }}>{item.name}</td>
                  <td>
                    <span className="dash-badge" style={{ backgroundColor: `color-mix(in srgb, ${CAT_COLORS[item.category]} 10%, transparent)`, color: CAT_COLORS[item.category] }}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.kecamatan}</td>
                  <td><code style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}</code></td>
                  <td><span className={`dash-badge ${item.active ? "dash-badge-success" : "dash-badge-danger"}`}>{item.active ? "Aktif" : "Non-Aktif"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <button onClick={() => openEdit(item)} title="Edit" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-primary)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm({ id: item.id, name: item.name })} title="Hapus" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-danger)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--dash-border)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dash-btn dash-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dash-btn dash-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "860px", position: "relative" }}>
            <button onClick={() => setModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "4px" }}><X size={18} /></button>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700, color: "var(--dash-text)", fontSize: "1rem" }}>{modalMode === "add" ? "Tambah Proyek Baru" : "Edit Proyek"}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Nama Objek *</label>
                  <input required className="dash-input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama lokasi proyek" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Kategori *</label>
                    <select className="dash-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ cursor: "pointer" }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Kecamatan *</label>
                    <select className="dash-input" value={form.kecamatan} onChange={e => setForm(p => ({ ...p, kecamatan: e.target.value }))} style={{ cursor: "pointer" }}>
                      {KECAMATANS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Alamat</label>
                  <input className="dash-input" value={form.address || ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Alamat jalan..." />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Latitude *</label>
                    <input required type="number" step="any" className="dash-input" value={form.lat || ""} onChange={e => setForm(p => ({ ...p, lat: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Longitude *</label>
                    <input required type="number" step="any" className="dash-input" value={form.lng || ""} onChange={e => setForm(p => ({ ...p, lng: Number(e.target.value) }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Fasilitas</label>
                    <input className="dash-input" placeholder="Mushola, Toilet, Gazebo" value={form.facilities || ""} onChange={e => setForm(p => ({ ...p, facilities: e.target.value }))} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--dash-text)", cursor: "pointer", fontWeight: 500, paddingBottom: "8px" }}>
                    <input type="checkbox" checked={form.active !== false} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ accentColor: "var(--dash-primary)" }} /> Aktif
                  </label>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Kontak</label>
                  <input className="dash-input" placeholder="+62812xxxx" value={form.contact || ""} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
                </div>
              </div>

              {/* Map */}
              <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Lokasi Peta</label>
                  <div style={{ height: "280px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                    <MapComponent
                      items={[]}
                      selectedItem={{ id: "picker", name: form.name || "Lokasi Baru", kecamatan: form.kecamatan || "", address: form.address || "", category: form.category || "Wisata Alam", lat: form.lat || -5.2514, lng: form.lng || 105.5451 }}
                      onSelectItem={() => {}}
                      isEditMode={true}
                      onCoordinatesChange={(lat, lng) => setForm(p => ({ ...p, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }))}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="dash-btn dash-btn-secondary" style={{ flex: 1, padding: "10px" }}>Batal</button>
                  <button type="submit" className="dash-btn" style={{ flex: 1, padding: "10px" }}>Simpan</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--dash-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: "var(--dash-danger)" }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--dash-text)", fontWeight: 700, fontSize: "0.95rem" }}>Hapus Proyek?</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--dash-text)" }}>{deleteConfirm.name}</strong> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn dash-btn-secondary" style={{ flex: 1, padding: "8px" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn dash-btn-danger" style={{ flex: 1, padding: "8px" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
