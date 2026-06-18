"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Save, MapPin, CheckCircle2, AlertCircle,
  Loader2, Compass, Phone, Tag, ImageIcon, X, FileText,
  Images, Plus, Link2,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { MapSkeleton } from "@/components/Skeleton";
import type { GalleryItem } from "@/components/admin/widgets/GalleryPickerModal";

const MapComponent       = dynamic(() => import("@/components/MapComponent"),                     { ssr: false, loading: () => <MapSkeleton /> });
const GalleryPickerModal = dynamic(() => import("@/components/admin/widgets/GalleryPickerModal"), { ssr: false });
const QuillEditorWidget  = dynamic(() => import("@/components/admin/widgets/QuillEditorWidget"),  { ssr: false });

const CATEGORIES = ["Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"];
const KECAMATANS = [
  "Sukadana","Labuhan Maringgai","Labuhan Ratu","Bandar Sribhawono",
  "Sekampung Udik","Pekalongan","Pasir Sakti","Way Jepara","Mataram Baru",
  "Braja Selebah","Jabung","Batanghari","Metro Kibang","Bumi Agung",
  "Raman Utara","Purbolinggo","Way Bungur",
];

interface FormData {
  name: string; category: string; kecamatan: string; address: string;
  lat: number; lng: number; active: boolean; facilities: string;
  contact: string; map_link: string; classification: string;
  rooms: string; food_type: string; capacity: string;
  imageUrl: string; description: string;
  slug: string; gallery: string[];
}

const DEFAULT: FormData = {
  name: "", category: "Wisata Alam", kecamatan: "Sukadana",
  address: "", lat: -5.2514, lng: 105.5451, active: true,
  facilities: "", contact: "", map_link: "", classification: "",
  rooms: "", food_type: "", capacity: "",
  imageUrl: "", description: "",
  slug: "", gallery: [],
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o").replace(/[ùúûü]/g, "u").replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

type Props = { mode: "create" | "edit"; editId?: string };

export default function DestinasiForm({ mode, editId }: Props) {
  const { user } = useAdmin();
  const router   = useRouter();
  const [form, setForm]       = useState<FormData>(DEFAULT);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState<"idle" | "ok" | "err">("idle");
  const [errMsg, setErrMsg]   = useState("");
  const [showPicker, setShowPicker]             = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [slugLocked, setSlugLocked]             = useState(false);

  useEffect(() => {
    if (slugLocked || mode === "edit") return;
    setForm(p => ({ ...p, slug: toSlug(p.name) }));
  }, [form.name, slugLocked, mode]);

  useEffect(() => {
    if (mode !== "edit" || !editId) return;
    fetch(`/api/destinations/${editId}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setForm({
            name: data.name || "", category: data.category || "Wisata Alam",
            kecamatan: data.kecamatan || "Sukadana", address: data.address || "",
            lat: data.lat ?? -5.2514, lng: data.lng ?? 105.5451,
            active: data.active !== false, facilities: data.facilities || "",
            contact: data.contact || "", map_link: data.map_link || "",
            classification: data.classification || "", rooms: data.rooms?.toString() || "",
            food_type: data.food_type || "", capacity: data.capacity?.toString() || "",
            imageUrl: data.imageUrl || "", description: data.description || "",
            slug: data.slug || toSlug(data.name || ""),
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
          });
          if (data.slug) setSlugLocked(true);
        }
      })
      .finally(() => setLoading(false));
  }, [mode, editId]);

  if (!["superadmin", "admin_dinas"].includes(user?.role || "")) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
        <MapPin size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
        <p>Akses ditolak.</p>
      </div>
    );
  }

  const upd = (k: keyof FormData, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.lat || !form.lng) {
      setStatus("err"); setErrMsg("Nama dan koordinat wajib diisi."); return;
    }
    setSaving(true); setStatus("idle");
    try {
      const payload = {
        ...form,
        lat: Number(form.lat), lng: Number(form.lng),
        rooms: form.rooms ? Number(form.rooms) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        food_type: form.food_type || undefined,
        classification: form.classification || undefined,
        map_link: form.map_link || undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        slug: form.slug || undefined,
        gallery: form.gallery.length > 0 ? form.gallery : undefined,
      };
      const url    = mode === "create" ? "/api/destinations" : `/api/destinations/${editId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setStatus("ok");
      setTimeout(() => router.push("/dashboard/destinasi"), 900);
    } catch (err: any) {
      setStatus("err"); setErrMsg(err.message || "Terjadi kesalahan");
    } finally { setSaving(false); }
  };

  const LBL = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
      {children}
    </label>
  );

  const SectionHead = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
      <span style={{ color: "var(--dash-primary)" }}>{icon}</span>
      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--dash-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh", gap: "0.5rem", color: "var(--dash-text-muted)" }}>
      <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--dash-primary)" }} /> Memuat data...
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.push("/dashboard/destinasi")} style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "7px", cursor: "pointer", color: "var(--dash-text-muted)", display: "flex" }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {mode === "create" ? "Tambah Baru" : "Edit Data"}
            </p>
            <h1 style={{ margin: "2px 0 0", fontSize: "1.35rem", fontWeight: 800, color: "var(--dash-text)" }}>
              {mode === "create" ? "Destinasi Baru" : form.name || "Edit Destinasi"}
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => router.push("/dashboard/destinasi")} className="dash-btn dash-btn-secondary" style={{ padding: "9px 18px" }}>
            Batal
          </button>
          <button form="dest-form" type="submit" className="dash-btn" disabled={saving} style={{ padding: "9px 20px", display: "flex", alignItems: "center", gap: "6px" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            {saving ? "Menyimpan..." : mode === "create" ? "Simpan Destinasi" : "Perbarui"}
          </button>
        </div>
      </div>

      {/* Status */}
      {status === "ok" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "var(--dash-success-bg)", border: "1px solid var(--dash-success)", borderRadius: "10px", color: "var(--dash-success)", fontWeight: 700, fontSize: "0.85rem" }}>
          <CheckCircle2 size={16} /> Berhasil disimpan! Mengalihkan...
        </div>
      )}
      {status === "err" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "var(--dash-danger-bg)", border: "1px solid var(--dash-danger)", borderRadius: "10px", color: "var(--dash-danger)", fontWeight: 700, fontSize: "0.85rem" }}>
          <AlertCircle size={16} /> {errMsg}
        </div>
      )}

      <form id="dest-form" onSubmit={handleSubmit}>
        <div className="dest-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "20px", alignItems: "start" }}>

          {/* ── LEFT: Form fields ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Informasi Dasar */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHead icon={<Compass size={15} />} label="Informasi Dasar" />

              <div>
                <LBL>Nama Destinasi *</LBL>
                <input required className="dash-input" value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Contoh: Pantai Kerang Mas" style={{ fontSize: "0.92rem" }} />
              </div>

              {/* Slug / SEO URL */}
              <div>
                <LBL>URL Slug (SEO)</LBL>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, borderRadius: "10px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", overflow: "hidden", transition: "border-color 0.15s" }}
                    onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--dash-primary)")}
                    onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--dash-border)")}>
                    <span style={{ padding: "0 10px", fontSize: "0.75rem", color: "var(--dash-text-muted)", borderRight: "1px solid var(--dash-border)", whiteSpace: "nowrap", lineHeight: "38px" }}>destinasi/</span>
                    <input
                      className="dash-input"
                      value={form.slug}
                      onChange={e => { setSlugLocked(true); upd("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")); }}
                      placeholder="nama-destinasi"
                      style={{ border: "none", borderRadius: 0, background: "transparent", flex: 1, fontFamily: "monospace", fontSize: "0.82rem" }}
                    />
                  </div>
                  {slugLocked && (
                    <button type="button" onClick={() => { setSlugLocked(false); upd("slug", toSlug(form.name)); }} title="Reset ke otomatis" style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-muted)", cursor: "pointer", display: "flex", fontSize: "0.7rem", gap: "4px", alignItems: "center" }}>
                      <Link2 size={12} /> Auto
                    </button>
                  )}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.67rem", color: "var(--dash-text-muted)" }}>
                  {slugLocked ? "Slug dikunci manual — klik Auto untuk reset otomatis dari nama." : "Dibuat otomatis dari nama destinasi."}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <LBL>Kategori *</LBL>
                  <select className="dash-input" value={form.category} onChange={e => upd("category", e.target.value)} style={{ cursor: "pointer" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <LBL>Kecamatan *</LBL>
                  <select className="dash-input" value={form.kecamatan} onChange={e => upd("kecamatan", e.target.value)} style={{ cursor: "pointer" }}>
                    {KECAMATANS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <LBL>Alamat Lengkap</LBL>
                <input className="dash-input" value={form.address} onChange={e => upd("address", e.target.value)} placeholder="Nama jalan, desa, dll." />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--dash-surface-hover)", borderRadius: "10px", border: "1px solid var(--dash-border)" }}>
                <input type="checkbox" id="active-toggle" checked={form.active} onChange={e => upd("active", e.target.checked)} style={{ accentColor: "var(--dash-primary)", width: "16px", height: "16px", cursor: "pointer" }} />
                <label htmlFor="active-toggle" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--dash-text)", cursor: "pointer" }}>
                  Destinasi Aktif & Beroperasi
                </label>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHead icon={<FileText size={15} />} label="Deskripsi Destinasi" />
              <QuillEditorWidget
                value={form.description}
                onChange={v => upd("description", v)}
                placeholder="Tuliskan deskripsi lengkap tentang destinasi ini — sejarah, keunikan, daya tarik, info kunjungan..."
                minHeight={240}
              />
            </div>

            {/* Kontak & Link */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHead icon={<Phone size={15} />} label="Kontak & Link" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <LBL>Nomor Kontak</LBL>
                  <input className="dash-input" value={form.contact} onChange={e => upd("contact", e.target.value)} placeholder="0812xxxxxxxx" />
                </div>
                <div>
                  <LBL>Link Google Maps</LBL>
                  <input className="dash-input" value={form.map_link} onChange={e => upd("map_link", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>
            </div>

            {/* Fasilitas & Detail */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHead icon={<Tag size={15} />} label="Fasilitas & Detail" />

              <div>
                <LBL>Fasilitas (pisahkan dengan koma)</LBL>
                <input className="dash-input" value={form.facilities} onChange={e => upd("facilities", e.target.value)} placeholder="Mushola, Toilet Umum, Area Parkir, Gazebo" />
                <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "var(--dash-text-muted)" }}>Contoh: Mushola, Toilet, Parkir Luas, Warung Makan</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <LBL>Klasifikasi</LBL>
                  <input className="dash-input" value={form.classification} onChange={e => upd("classification", e.target.value)} placeholder="Bintang 3, Non Bintang, dll." />
                </div>
                {form.category === "Akomodasi" && (
                  <div>
                    <LBL>Jumlah Kamar</LBL>
                    <input type="number" min="0" className="dash-input" value={form.rooms} onChange={e => upd("rooms", e.target.value)} placeholder="Jumlah kamar tersedia" />
                  </div>
                )}
                <div>
                  <LBL>Jenis Masakan</LBL>
                  <input className="dash-input" value={form.food_type} onChange={e => upd("food_type", e.target.value)} placeholder="Khusus kuliner" />
                </div>
                <div>
                  <LBL>Kapasitas (orang)</LBL>
                  <input type="number" min="0" className="dash-input" value={form.capacity} onChange={e => upd("capacity", e.target.value)} placeholder="Maks. pengunjung" />
                </div>
              </div>
            </div>

            {/* Galeri Foto */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <SectionHead icon={<Images size={15} />} label={`Galeri Foto (${form.gallery.length}/6)`} />
                {form.gallery.length < 6 && (
                  <button type="button" onClick={() => setShowGalleryPicker(true)} className="dash-btn" style={{ padding: "6px 14px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Plus size={13} /> Tambah Foto
                  </button>
                )}
              </div>

              {form.gallery.length === 0 ? (
                <div onClick={() => setShowGalleryPicker(true)} style={{ border: "2px dashed var(--dash-border)", borderRadius: "12px", padding: "2.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", transition: "all 0.15s" }}
                  onMouseOver={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-primary)"; t.style.color = "var(--dash-primary)"; }}
                  onMouseOut={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-border)"; t.style.color = "var(--dash-text-muted)"; }}>
                  <Images size={28} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Tambah Foto Galeri</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>Min. 1, maks. 6 foto</span>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {form.gallery.map((url, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                      <img src={url} alt={`foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <button type="button" onClick={() => upd("gallery", form.gallery.filter((_, j) => j !== i))} style={{ position: "absolute", top: "5px", right: "5px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(220,38,38,0.85)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                        <X size={11} />
                      </button>
                      <div style={{ position: "absolute", bottom: "4px", left: "6px", fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{i + 1}</div>
                    </div>
                  ))}
                  {form.gallery.length < 6 && (
                    <div onClick={() => setShowGalleryPicker(true)} style={{ aspectRatio: "4/3", borderRadius: "10px", border: "2px dashed var(--dash-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer", color: "var(--dash-text-muted)", transition: "all 0.15s" }}
                      onMouseOver={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-primary)"; t.style.color = "var(--dash-primary)"; }}
                      onMouseOut={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-border)"; t.style.color = "var(--dash-text-muted)"; }}>
                      <Plus size={18} />
                      <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>Tambah</span>
                    </div>
                  )}
                </div>
              )}
              <p style={{ margin: 0, fontSize: "0.67rem", color: "var(--dash-text-muted)" }}>
                Pilih dari galeri atau upload langsung. Foto ditampilkan di halaman publik destinasi.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Thumbnail + Map ── */}
          <div className="dest-form-aside" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Thumbnail */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
              <SectionHead icon={<ImageIcon size={15} />} label="Foto Sampul" />

              {form.imageUrl ? (
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--dash-border)", aspectRatio: "16/9" }}>
                  <img src={form.imageUrl} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "6px" }}>
                    <button type="button" onClick={() => setShowPicker(true)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" }}>Ganti</button>
                    <button type="button" onClick={() => upd("imageUrl", "")} style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(220,38,38,0.8)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}><X size={13} /></button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setShowPicker(true)} style={{ border: "2px dashed var(--dash-border)", borderRadius: "12px", padding: "2.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", transition: "all 0.15s", aspectRatio: "16/9" }}
                  onMouseOver={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-primary)"; t.style.background = "var(--dash-primary-bg)"; t.style.color = "var(--dash-primary)"; }}
                  onMouseOut={e => { const t = e.currentTarget as HTMLElement; t.style.borderColor = "var(--dash-border)"; t.style.background = "var(--dash-surface-hover)"; t.style.color = "var(--dash-text-muted)"; }}>
                  <ImageIcon size={28} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Pilih Foto Sampul</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>dari Galeri</span>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="dash-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHead icon={<MapPin size={15} />} label="Lokasi di Peta" />

              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>
                Klik pada peta untuk menentukan titik koordinat, atau isi manual di bawah.
              </p>

              <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                <MapComponent
                  items={[]}
                  selectedItem={{ id: editId || "new", name: form.name || "Lokasi Baru", kecamatan: form.kecamatan, address: form.address, category: form.category, lat: form.lat, lng: form.lng }}
                  onSelectItem={() => {}}
                  isEditMode={true}
                  onCoordinatesChange={(lat, lng) => { upd("lat", Number(lat.toFixed(6))); upd("lng", Number(lng.toFixed(6))); }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <LBL>Latitude *</LBL>
                  <input required type="number" step="any" className="dash-input" value={form.lat} onChange={e => upd("lat", Number(e.target.value))} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
                </div>
                <div>
                  <LBL>Longitude *</LBL>
                  <input required type="number" step="any" className="dash-input" value={form.lng} onChange={e => upd("lng", Number(e.target.value))} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
                </div>
              </div>

              <div style={{ padding: "10px 12px", background: "var(--dash-primary-bg)", borderRadius: "8px", fontSize: "0.72rem", color: "var(--dash-text-muted)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--dash-primary)" }}>Tips:</strong> Koordinat Lampung Timur umumnya Lat -5.0 s/d -5.8, Lng 105.2 s/d 105.9
              </div>
            </div>
          </div>
        </div>
      </form>

      {showPicker && (
        <GalleryPickerModal
          multi={false}
          onSelect={(items: GalleryItem[]) => { if (items[0]) upd("imageUrl", items[0].imageUrl); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showGalleryPicker && (
        <GalleryPickerModal
          multi={true}
          selectedIds={[]}
          onSelect={(items: GalleryItem[]) => {
            const incoming = items.map(i => i.imageUrl);
            const merged   = [...form.gallery, ...incoming.filter(u => !form.gallery.includes(u))];
            upd("gallery", merged.slice(0, 6));
            setShowGalleryPicker(false);
          }}
          onClose={() => setShowGalleryPicker(false)}
        />
      )}
    </div>
  );
}
