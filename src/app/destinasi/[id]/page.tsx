"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, ExternalLink, ChevronRight, CheckCircle2, Map,
  ArrowLeft, Utensils, Hotel, TreePine, Landmark, Milestone, Users,
  BedDouble, Share2, Check, X as XIcon, ChevronLeft, ChevronRight as CR,
  Images, Info, Star, RefreshCw, Compass,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/Skeleton";
import { sanitizeHtml } from "@/lib/sanitize";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface Destination {
  id: string; name: string; category: string; kecamatan: string;
  address: string; lat: number; lng: number; active: boolean;
  facilities?: string; contact?: string; map_link?: string;
  classification?: string; rooms?: number; food_type?: string; capacity?: number;
  imageUrl?: string; description?: string; gallery?: string[];
}
interface GalleryItem { id: string; title: string; category: string; imageUrl: string; }

const CAT_COLOR: Record<string, string> = {
  "Wisata Alam": "#059669", "Wisata Buatan": "#d97706",
  "Wisata Budaya": "#8b5cf6", "Akomodasi": "#3b82f6", "Kuliner": "#ec4899",
};
const CAT_BG: Record<string, string> = {
  "Wisata Alam": "#ecfdf5", "Wisata Buatan": "#fffbeb",
  "Wisata Budaya": "#f5f3ff", "Akomodasi": "#eff6ff", "Kuliner": "#fdf2f8",
};
const CAT_ICON: Record<string, React.ReactNode> = {
  "Wisata Alam": <TreePine size={15} />, "Wisata Buatan": <Milestone size={15} />,
  "Wisata Budaya": <Landmark size={15} />, "Akomodasi": <Hotel size={15} />, "Kuliner": <Utensils size={15} />,
};
const CAT_GRADIENT: Record<string, string> = {
  "Wisata Alam":   "linear-gradient(to top,rgba(2,44,34,0.96) 0%,rgba(4,60,45,0.7) 50%,rgba(0,0,0,0.1) 100%)",
  "Wisata Buatan": "linear-gradient(to top,rgba(69,26,3,0.96) 0%,rgba(120,53,15,0.7) 50%,rgba(0,0,0,0.1) 100%)",
  "Wisata Budaya": "linear-gradient(to top,rgba(46,16,101,0.96) 0%,rgba(76,29,149,0.7) 50%,rgba(0,0,0,0.1) 100%)",
  "Akomodasi":     "linear-gradient(to top,rgba(12,26,107,0.96) 0%,rgba(29,78,216,0.7) 50%,rgba(0,0,0,0.1) 100%)",
  "Kuliner":       "linear-gradient(to top,rgba(80,7,36,0.96) 0%,rgba(157,23,77,0.7) 50%,rgba(0,0,0,0.1) 100%)",
};

type Tab = "info" | "fasilitas" | "peta";

export default function DestinasiDetailPage() {
  const params = useParams();
  const id     = params?.id as string;

  const [dest, setDest]         = useState<Destination | null>(null);
  const [related, setRelated]   = useState<Destination[]>([]);
  const [gallery, setGallery]   = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab]           = useState<Tab>("info");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/destinations/${id}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then((data: Destination | null) => {
        if (!data) return;
        setDest(data);
        fetch("/api/destinations")
          .then(r => r.json())
          .then((all: Destination[]) => {
            if (!Array.isArray(all)) return;
            setRelated(all.filter(d => d.category === data.category && d.id !== id && d.active !== false).slice(0, 4));
          });
        if (Array.isArray(data.gallery) && data.gallery.length > 0) {
          setGallery(data.gallery.map((url: string, i: number) => ({ id: `own_${i}`, title: data.name, category: data.category, imageUrl: url })));
        } else {
          const kw = data.category.split(" ").pop() || "";
          fetch("/api/gallery")
            .then(r => r.json())
            .then((gal: GalleryItem[]) => {
              if (!Array.isArray(gal)) return;
              const filtered = gal.filter(g => g.category.toLowerCase().includes(kw.toLowerCase())).slice(0, 6);
              setGallery(filtered.length >= 2 ? filtered : gal.slice(0, 6));
            }).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: "0.5rem" }}>
      <RefreshCw size={22} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
      <span style={{ color: "var(--text-secondary)" }}>Memuat destinasi...</span>
    </div>
  );

  if (notFound || !dest) return (
    <div className="container" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
      <Compass size={52} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.3 }} />
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Destinasi Tidak Ditemukan</h2>
      <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Destinasi yang Anda cari tidak tersedia.</p>
      <Link href="/destinasi" style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", background: "var(--primary)", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
        <ArrowLeft size={15} /> Kembali ke Daftar Destinasi
      </Link>
    </div>
  );

  const color    = CAT_COLOR[dest.category]    ?? "#059669";
  const bg       = CAT_BG[dest.category]       ?? "#ecfdf5";
  const icon     = CAT_ICON[dest.category];
  const gradient = CAT_GRADIENT[dest.category] ?? CAT_GRADIENT["Wisata Alam"];
  const facs     = dest.facilities ? dest.facilities.split(",").map(f => f.trim()).filter(Boolean) : [];
  const mapItem  = { ...dest, facilities: facs };
  const mapItems = dest.lat && dest.lng ? [mapItem] : [];
  const heroImg  = dest.imageUrl || (gallery[0]?.imageUrl) || "/Gallery/hero1.avif";

  const pageUrl    = typeof window !== "undefined" ? window.location.href : "";
  const shareWA    = `https://wa.me/?text=${encodeURIComponent(dest.name + " — Destinasi Lampung Timur\n" + pageUrl)}`;
  const shareX     = `https://twitter.com/intent/tweet?text=${encodeURIComponent(dest.name + " — Destinasi Wisata Lampung Timur")}&url=${encodeURIComponent(pageUrl)}`;
  const shareEmail = `mailto:?subject=${encodeURIComponent(dest.name)}&body=${encodeURIComponent(dest.name + "\n\n" + pageUrl)}`;
  const waContact  = dest.contact
    ? `https://wa.me/62${dest.contact.replace(/^0/, "")}?text=${encodeURIComponent("Halo, saya ingin mengetahui lebih lanjut tentang " + dest.name + ".")}`
    : null;

  const copyUrl   = () => { navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const prevPhoto = () => setPhotoIdx(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % gallery.length);

  return (
    <div style={{ paddingBottom: "5rem" }}>

      {/* ── HERO ── */}
      <div className="container" style={{ paddingTop: "2.5rem" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Beranda</Link>
          <ChevronRight size={13} />
          <Link href="/destinasi" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Destinasi Wisata</Link>
          <ChevronRight size={13} />
          <span style={{ color, fontWeight: 600 }}>{dest.name.length > 50 ? dest.name.slice(0, 50) + "…" : dest.name}</span>
        </nav>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15, maxWidth: "860px", letterSpacing: "-0.02em", margin: "0 0 0.9rem" }}>
          {dest.name}
        </h1>

        {/* Category badge — di bawah judul */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: bg, color, padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "1.75rem" }}>
          {icon} {dest.category}
        </div>

        {/* Cover image — full width in container, like berita detail */}
        <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", aspectRatio: "16/7", marginBottom: "2rem" }}>
          <img src={heroImg} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>

      {/* ── BODY ── */}
        <div className="dest-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", gap: "0.25rem" }}>
              {([["info", "Informasi", <Info size={14} />], ["fasilitas", "Fasilitas", <CheckCircle2 size={14} />], ["peta", "Peta Lokasi", <Map size={14} />]] as [Tab, string, React.ReactNode][]).map(([t, label, ic]) => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "0.7rem 1.2rem", fontSize: "0.84rem", fontWeight: 700, color: tab === t ? color : "#94a3b8", background: "none", border: "none", borderBottom: tab === t ? `2.5px solid ${color}` : "2.5px solid transparent", marginBottom: "-2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "color 0.15s", whiteSpace: "nowrap" }}>
                  {ic} {label}
                </button>
              ))}
            </div>

            {/* Tab: Informasi */}
            {tab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Description */}
                <div style={{ padding: "1.5rem", background: "white", borderRadius: "18px", border: "1px solid #f1f5f9", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tentang Destinasi</p>
                  {dest.description
                    ? <div style={{ fontSize: "0.93rem", lineHeight: 1.8, color: "#374151" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(dest.description) }} />
                    : <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbd5e1", fontStyle: "italic" }}>Deskripsi belum tersedia.</p>
                  }
                </div>

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.85rem" }}>
                  <InfoCard label="Kecamatan"  value={dest.kecamatan}    accent={color} icon={<MapPin size={13} />} />
                  <InfoCard label="Kategori"   value={dest.category}     accent={color} icon={icon} />
                  {dest.classification && <InfoCard label="Klasifikasi"  value={dest.classification} accent={color} icon={<Star size={13} />} />}
                  {dest.food_type      && <InfoCard label="Jenis Masakan" value={dest.food_type}     accent={color} icon={<Utensils size={13} />} />}
                  {dest.rooms          ? <InfoCard label="Jumlah Kamar"  value={`${dest.rooms} kamar`}  accent={color} icon={<BedDouble size={13} />} /> : null}
                  {dest.capacity       ? <InfoCard label="Kapasitas"     value={`${dest.capacity} orang`} accent={color} icon={<Users size={13} />} /> : null}
                </div>

                {/* Address */}
                {dest.address && (
                  <div style={{ display: "flex", gap: "0.85rem", padding: "1.1rem 1.35rem", background: bg, borderRadius: "14px", border: `1px solid ${color}25` }}>
                    <MapPin size={18} style={{ color, flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: "0 0 0.2rem", fontSize: "0.67rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Alamat Lengkap</p>
                      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.55 }}>{dest.address}</p>
                    </div>
                  </div>
                )}

                {/* Gallery carousel */}
                {gallery.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Galeri Foto</p>
                    <div style={{ borderRadius: "18px", overflow: "hidden", position: "relative", aspectRatio: "16/8", background: "#0f172a", cursor: "zoom-in", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }} onClick={() => setLightbox(true)}>
                      <img src={gallery[photoIdx]?.imageUrl} alt={gallery[photoIdx]?.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 45%)" }} />
                      {gallery.length > 1 && (<>
                        <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={arrowBtn("left")}><ChevronLeft size={20} color="white" /></button>
                        <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={arrowBtn("right")}><CR size={20} color="white" /></button>
                      </>)}
                      <div style={{ position: "absolute", top: "0.85rem", right: "0.85rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", borderRadius: "8px", padding: "0.3rem 0.7rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "white", fontSize: "0.7rem", fontWeight: 700 }}>
                        <Images size={12} /> {photoIdx + 1}/{gallery.length}
                      </div>
                    </div>
                    {gallery.length > 1 && (
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(gallery.length, 6)}, 1fr)`, gap: "0.5rem" }}>
                        {gallery.map((g, i) => (
                          <button key={g.id} onClick={() => setPhotoIdx(i)} style={{ aspectRatio: "4/3", borderRadius: "10px", overflow: "hidden", border: `2.5px solid ${i === photoIdx ? color : "transparent"}`, padding: 0, cursor: "pointer", background: "none", transition: "border-color 0.15s, opacity 0.15s", opacity: i === photoIdx ? 1 : 0.6, width: "100%" }}>
                            <img src={g.imageUrl} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Fasilitas */}
            {tab === "fasilitas" && (
              <div>
                {facs.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.7rem" }}>
                    {facs.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.8rem 1.1rem", background: "white", border: `1px solid ${color}20`, borderLeft: `3px solid ${color}`, borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <CheckCircle2 size={15} style={{ color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.87rem", fontWeight: 600, color: "#334155" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                    <CheckCircle2 size={36} style={{ opacity: 0.2, marginBottom: "0.75rem" }} />
                    <p style={{ margin: 0 }}>Data fasilitas belum tersedia.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Peta */}
            {tab === "peta" && dest.lat && dest.lng && (
              <div style={{ borderRadius: "18px", overflow: "hidden", height: "400px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <MapComponent items={mapItems} selectedItem={mapItem} onSelectItem={() => {}} />
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="dest-detail-aside" style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "80px" }}>

            {/* Contact card */}
            <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              {/* Colored header */}
              <div style={{ background: color, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px", display: "flex" }}>{icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hubungi & Kunjungi</p>
                  <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "white" }}>{dest.name.length > 28 ? dest.name.slice(0, 28) + "…" : dest.name}</p>
                </div>
              </div>

              <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {dest.map_link && (
                  <a href={dest.map_link} target="_blank" rel="noopener noreferrer" style={actionBtn(color)}>
                    <ExternalLink size={15} /> Buka Google Maps
                  </a>
                )}
                {dest.contact && (
                  <a href={`tel:${dest.contact}`} style={actionBtn("#1e293b")}>
                    <Phone size={15} /> {dest.contact}
                  </a>
                )}
                {waContact && (
                  <a href={waContact} target="_blank" rel="noopener noreferrer" style={actionBtn("#25D366")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Share card */}
            <div style={{ background: "white", borderRadius: "18px", padding: "1.1rem 1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.67rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Share2 size={12} /> Bagikan
              </p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <a href={shareWA}    target="_blank" rel="noopener noreferrer" title="WhatsApp" style={sIcon("#25D366")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href={shareX}     target="_blank" rel="noopener noreferrer" title="X / Twitter" style={sIcon("#000")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={shareEmail} title="Email" style={sIcon("#6366f1")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                </a>
                <button onClick={copyUrl} title={copied ? "Disalin!" : "Salin URL"} style={{ ...sIcon(copied ? "#059669" : "#64748b"), border: "none", cursor: "pointer" }}>
                  {copied ? <Check size={14} color="white" /> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                </button>
                {copied && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#059669" }}>Disalin!</span>}
              </div>
            </div>

            {/* Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.85rem 1.1rem", background: dest.active ? "#f0fdf4" : "#fef2f2", borderRadius: "14px", border: `1px solid ${dest.active ? "#bbf7d0" : "#fecaca"}` }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dest.active ? "#22c55e" : "#ef4444", flexShrink: 0, boxShadow: dest.active ? "0 0 0 3px #bbf7d0" : "0 0 0 3px #fecaca" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: dest.active ? "#15803d" : "#dc2626" }}>
                {dest.active ? "Destinasi Beroperasi" : "Sementara Tutup"}
              </span>
            </div>

            {/* Back link */}
            <Link href="/destinasi" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "0.84rem", fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}>
              <ArrowLeft size={14} /> Semua Destinasi
            </Link>
          </div>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Destinasi {dest.category} Lainnya</h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>Temukan lebih banyak destinasi serupa di Lampung Timur</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1rem" }}>
              {related.map(r => {
                const rc = CAT_COLOR[r.category] ?? color;
                const rb = CAT_BG[r.category]   ?? bg;
                return (
                  <Link key={r.id} href={`/destinasi/${r.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = "translateY(-5px)"; t.style.boxShadow = "0 16px 32px rgba(0,0,0,0.1)"; }}
                      onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = ""; t.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}>
                      {/* Thumbnail */}
                      <div style={{ height: "130px", background: rb, position: "relative", overflow: "hidden" }}>
                        {r.imageUrl
                          ? <img src={r.imageUrl} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: rc, opacity: 0.3 }}>{CAT_ICON[r.category]}</div>
                        }
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 60%)" }} />
                        <div style={{ position: "absolute", top: "8px", left: "8px", fontSize: "0.62rem", fontWeight: 800, color: rc, background: "white", padding: "0.15rem 0.55rem", borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.category}</div>
                      </div>
                      <div style={{ padding: "1rem" }}>
                        <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.35rem", lineHeight: 1.3 }}>{r.name}</p>
                        <p style={{ fontSize: "0.76rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <MapPin size={11} style={{ color: rc, flexShrink: 0 }} /> Kec. {r.kecamatan}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && gallery.length > 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLightbox(false)}>
          <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={{ ...arrowBtn("left"), position: "fixed", left: "1.25rem", width: "46px", height: "46px" }}><ChevronLeft size={24} color="white" /></button>
          <img src={gallery[photoIdx]?.imageUrl} alt={gallery[photoIdx]?.title} style={{ maxWidth: "90vw", maxHeight: "86vh", objectFit: "contain", borderRadius: "14px", boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={{ ...arrowBtn("right"), position: "fixed", right: "1.25rem", width: "46px", height: "46px" }}><CR size={24} color="white" /></button>
          <button onClick={() => setLightbox(false)} style={{ position: "fixed", top: "1.25rem", right: "1.25rem", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}>
            <XIcon size={19} color="white" />
          </button>
          <div style={{ position: "fixed", bottom: "1.75rem", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 700, background: "rgba(0,0,0,0.5)", padding: "0.4rem 1rem", borderRadius: "20px", backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>
            {photoIdx + 1} / {gallery.length} — {gallery[photoIdx]?.title}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .dest-detail-grid { grid-template-columns: 1fr !important; }
          .dest-detail-aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Helpers ── */
function MetaChip({ icon, text, color, bg }: { icon: React.ReactNode; text: string; color: string; bg: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: bg, color, padding: "0.3rem 0.85rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${color}25` }}>
      {icon} {text}
    </div>
  );
}

function InfoCard({ label, value, accent, icon }: { label: string; value: string | React.ReactNode; accent: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "1.1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", borderTop: `3px solid ${accent}` }}>
      <p style={{ margin: "0 0 0.3rem", fontSize: "0.63rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <span style={{ color: accent }}>{icon}</span> {label}
      </p>
      <p style={{ margin: 0, fontSize: "0.93rem", fontWeight: 800, color: "#0f172a" }}>{value}</p>
    </div>
  );
}

function arrowBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", [side]: "0.75rem",
    transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(8px)", border: "none", borderRadius: "50%",
    width: "40px", height: "40px", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", zIndex: 2,
    transition: "background 0.15s",
  };
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: "0.6rem",
    padding: "0.75rem 1rem", borderRadius: "11px", backgroundColor: bg,
    color: "white", fontWeight: 700, fontSize: "0.85rem",
    textDecoration: "none", width: "100%", boxSizing: "border-box",
    transition: "opacity 0.15s",
  };
}

function sIcon(bg: string): React.CSSProperties {
  return {
    width: "36px", height: "36px", borderRadius: "50%",
    backgroundColor: bg, display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    textDecoration: "none", flexShrink: 0, transition: "opacity 0.15s",
  };
}
