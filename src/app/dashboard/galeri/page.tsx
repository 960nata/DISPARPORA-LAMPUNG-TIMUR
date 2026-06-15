"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, UploadCloud, Image as ImageIcon, ArrowUp, ArrowDown, Loader2, Images } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

const CATEGORIES = ["Alam", "Bahari", "Budaya", "Sejarah", "Kuliner", "Event", "Lainnya"];

const CAT_COLORS: Record<string, string> = {
  Alam: "#059669", Bahari: "#0284c7", Budaya: "#7c3aed",
  Sejarah: "#b45309", Kuliner: "#db2777", Event: "#d97706", Lainnya: "#475569",
};

const fileToDataUrl = (file: File) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(file);
});

const emptyForm = { title: "", category: "Alam", imageData: "", imageUrl: "" };

export default function GaleriPage() {
  const { user } = useAdmin();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("Semua");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "Alam" });

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const load = () => {
    fetch("/api/gallery").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (!user) {
    return <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}><Images size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} /><p>Akses ditolak.</p></div>;
  }

  const filtered = catFilter === "Semua" ? items : items.filter(i => i.category === catFilter);

  const handleFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setForm(p => ({ ...p, imageData: dataUrl, imageUrl: "" }));
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { alert("Judul wajib diisi."); return; }
    if (!form.imageData && !form.imageUrl.trim()) { alert("Unggah gambar atau isi URL."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), category: form.category, imageData: form.imageData, imageUrl: form.imageUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah");
      setUploadOpen(false);
      setForm({ ...emptyForm });
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: GalleryItem) => {
    setEditTarget(item);
    setEditForm({ title: item.title, category: item.category });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/gallery/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editForm.title.trim(), category: editForm.category }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menyimpan"); }
      setEditTarget(null);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/gallery/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menghapus"); }
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Swap order with the adjacent item (in the full sorted list)
  const move = async (item: GalleryItem, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(i => i.id === item.id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;
    const a = item.order, b = swapWith.order;
    try {
      await Promise.all([
        fetch(`/api/gallery/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: b }) }),
        fetch(`/api/gallery/${swapWith.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: a }) }),
      ]);
      load();
    } catch { /* noop */ }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Konten Homepage</p>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-text)" }}>Manajemen Galeri</h1>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>{items.length} foto pada galeri beranda</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setUploadOpen(true); }} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
          <Plus size={16} /> Unggah Foto
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {["Semua", ...CATEGORIES].map(c => {
          const active = catFilter === c;
          const color = c === "Semua" ? "var(--dash-primary)" : (CAT_COLORS[c] || "var(--dash-primary)");
          return (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: "0.4rem 0.85rem", borderRadius: "999px", border: "1px solid",
                borderColor: active ? color : "var(--dash-border)",
                backgroundColor: active ? color : "transparent",
                color: active ? "#fff" : "var(--dash-text-muted)",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--dash-text-muted)" }}>
          <Loader2 size={26} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-card" style={{ padding: "3.5rem", textAlign: "center", color: "var(--dash-text-muted)" }}>
          <ImageIcon size={36} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
          <p style={{ margin: 0, fontSize: "0.88rem" }}>Belum ada foto pada kategori ini.</p>
        </div>
      ) : (
        <div className="gallery-masonry">
          {filtered.map((item, i) => (
            <div key={item.id} className="gallery-card dash-card" style={{ padding: 0, overflow: "hidden", position: "relative", breakInside: "avoid", marginBottom: "1rem" }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: "100%", display: "block", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0.25"; }} />

              {/* category badge */}
              <span style={{ position: "absolute", top: "0.6rem", left: "0.6rem", backgroundColor: CAT_COLORS[item.category] || "#475569", color: "#fff", fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0.2rem 0.55rem", borderRadius: "6px" }}>{item.category}</span>

              {/* hover actions */}
              <div className="gallery-actions" style={{ position: "absolute", top: "0.6rem", right: "0.6rem", display: "flex", gap: "0.3rem" }}>
                <button onClick={() => move(item, -1)} disabled={i === 0 && catFilter === "Semua"} title="Naikkan" style={iconBtn}><ArrowUp size={14} /></button>
                <button onClick={() => move(item, 1)} title="Turunkan" style={iconBtn}><ArrowDown size={14} /></button>
                <button onClick={() => openEdit(item)} title="Edit" style={iconBtn}><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget(item)} title="Hapus" style={{ ...iconBtn, color: "#dc2626" }}><Trash2 size={14} /></button>
              </div>

              {/* title bar */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "1.5rem 0.8rem 0.7rem", background: "linear-gradient(to top, rgba(0,0,0,0.78), transparent)" }}>
                <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3 }}>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "480px", position: "relative" }}>
            <button onClick={() => setUploadOpen(false)} style={closeBtn}><X size={18} /></button>
            <h3 style={{ margin: "0 0 18px", fontWeight: 800, color: "var(--dash-text)", fontSize: "1.05rem" }}>Unggah Foto Galeri</h3>
            <form onSubmit={submitUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* dropzone / preview */}
              {form.imageData ? (
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                  <img src={form.imageData} alt="" style={{ width: "100%", height: "190px", objectFit: "cover", display: "block" }} />
                  <button type="button" onClick={() => setForm(p => ({ ...p, imageData: "" }))} style={{ ...closeBtn, top: "8px", right: "8px", background: "var(--dash-surface)", borderRadius: "50%", border: "1px solid var(--dash-border)" }}><X size={15} /></button>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "2.2rem 1rem", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                    border: `1.5px dashed ${dragOver ? "var(--dash-primary)" : "var(--dash-border-2)"}`, backgroundColor: dragOver ? "var(--dash-primary-bg)" : "transparent", transition: "all 0.2s" }}>
                  <UploadCloud size={28} style={{ color: "var(--dash-primary)" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dash-text)" }}>Seret & lepas foto di sini</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)" }}>otomatis dikonversi ke AVIF · atau klik untuk pilih</span>
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
                </label>
              )}

              {!form.imageData && (
                <input className="dash-input" placeholder="atau tempel URL gambar..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} style={{ fontSize: "0.82rem" }} />
              )}

              <div>
                <label style={fieldLabel}>Judul Foto *</label>
                <input required className="dash-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="cth. Pantai Kerang Mas" />
              </div>
              <div>
                <label style={fieldLabel}>Kategori</label>
                <select className="dash-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ cursor: "pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
                <button type="button" onClick={() => setUploadOpen(false)} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", boxShadow: "none", fontSize: "0.82rem" }}>Batal</button>
                <button type="submit" disabled={saving} className="dash-btn" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <UploadCloud size={15} />} {saving ? "Mengunggah..." : "Unggah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "420px", position: "relative" }}>
            <button onClick={() => setEditTarget(null)} style={closeBtn}><X size={18} /></button>
            <h3 style={{ margin: "0 0 18px", fontWeight: 800, color: "var(--dash-text)", fontSize: "1.05rem" }}>Edit Foto</h3>
            <img src={editTarget.imageUrl} alt="" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginBottom: "1rem" }} />
            <form onSubmit={submitEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={fieldLabel}>Judul Foto</label>
                <input required className="dash-input" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={fieldLabel}>Kategori</label>
                <select className="dash-input" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} style={{ cursor: "pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setEditTarget(null)} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", boxShadow: "none", fontSize: "0.82rem" }}>Batal</button>
                <button type="submit" disabled={saving} className="dash-btn" style={{ fontSize: "0.82rem" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "380px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--dash-danger-bg)", color: "var(--dash-danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}><Trash2 size={22} /></div>
            <h3 style={{ margin: "0 0 0.5rem", fontWeight: 800, color: "var(--dash-text)", fontSize: "1rem" }}>Hapus foto ini?</h3>
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.84rem", color: "var(--dash-text-muted)" }}>"{deleteTarget.title}" akan dihapus dari galeri beranda. Tindakan ini tidak bisa dibatalkan.</p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", boxShadow: "none", fontSize: "0.82rem" }}>Batal</button>
              <button onClick={confirmDelete} disabled={saving} className="dash-btn" style={{ backgroundColor: "var(--dash-danger)", fontSize: "0.82rem" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .gallery-masonry { column-count: 4; column-gap: 1rem; }
        @media (max-width: 1200px) { .gallery-masonry { column-count: 3; } }
        @media (max-width: 820px)  { .gallery-masonry { column-count: 2; } }
        @media (max-width: 520px)  { .gallery-masonry { column-count: 1; } }
        .gallery-card .gallery-actions { opacity: 0; transition: opacity 0.2s ease; }
        .gallery-card:hover .gallery-actions { opacity: 1; }
      `}</style>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: "28px", height: "28px", borderRadius: "7px", border: "none", cursor: "pointer",
  background: "rgba(255,255,255,0.92)", color: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
};

const closeBtn: React.CSSProperties = {
  position: "absolute", top: "16px", right: "16px", background: "none", border: "none",
  color: "var(--dash-text-muted)", cursor: "pointer", padding: "4px",
};

const fieldLabel: React.CSSProperties = {
  display: "block", fontSize: "0.76rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px",
};
