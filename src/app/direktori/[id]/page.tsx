"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, ExternalLink, ChevronRight, CheckCircle2, Map,
  ArrowLeft, Utensils, Hotel, TreePine, Landmark, Milestone, Users,
  BedDouble, Share2, Check, X, ChevronLeft, ChevronRight as CR,
  Images, Info, Star,
} from "lucide-react";
import dynamic from "next/dynamic";
import tourismData from "@/data/tourism.json";
import { MapSkeleton } from "@/components/Skeleton";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/* ── Category config ──────────────────────────── */
const CAT_COLOR: Record<string, string> = {
  "Wisata Alam":   "#059669",
  "Wisata Buatan": "#d97706",
  "Wisata Budaya": "#8b5cf6",
  "Akomodasi":     "#3b82f6",
  "Kuliner":       "#ec4899",
};
const CAT_BG: Record<string, string> = {
  "Wisata Alam":   "#ecfdf5",
  "Wisata Buatan": "#fffbeb",
  "Wisata Budaya": "#f5f3ff",
  "Akomodasi":     "#eff6ff",
  "Kuliner":       "#fdf2f8",
};
const CAT_ICON: Record<string, React.ReactNode> = {
  "Wisata Alam":   <TreePine size={16} />,
  "Wisata Buatan": <Milestone size={16} />,
  "Wisata Budaya": <Landmark size={16} />,
  "Akomodasi":     <Hotel size={16} />,
  "Kuliner":       <Utensils size={16} />,
};
const CAT_GRADIENT: Record<string, string> = {
  "Wisata Alam":   "linear-gradient(135deg,#052e16 0%,#064e3b 60%,rgba(6,78,59,0.15) 100%)",
  "Wisata Buatan": "linear-gradient(135deg,#451a03 0%,#92400e 60%,rgba(146,64,14,0.15) 100%)",
  "Wisata Budaya": "linear-gradient(135deg,#2e1065 0%,#4c1d95 60%,rgba(76,29,149,0.15) 100%)",
  "Akomodasi":     "linear-gradient(135deg,#0c1a6b 0%,#1d4ed8 60%,rgba(29,78,216,0.15) 100%)",
  "Kuliner":       "linear-gradient(135deg,#500724 0%,#9d174d 60%,rgba(157,23,77,0.15) 100%)",
};

interface TourismItem {
  id: string; name: string; kecamatan: string; address: string;
  category: string; lat: number; lng: number; active?: boolean;
  facilities?: string[]; contact?: string; map_link?: string;
  classification?: string; rooms?: number; food_type?: string; capacity?: number;
}
interface GalleryItem { id: string; title: string; category: string; imageUrl: string; }

type Tab = "info" | "fasilitas" | "peta";

export default function DestinationDetailPage() {
  const params   = useParams();
  const id       = params?.id as string;
  const [tab, setTab]       = useState<Tab>("info");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied]   = useState(false);

  const allItems = useMemo<TourismItem[]>(() => [
    ...tourismData.wisata_alam.map(i => ({ ...i, category: "Wisata Alam" })),
    ...tourismData.wisata_buatan.map(i => ({ ...i, category: "Wisata Buatan" })),
    ...tourismData.wisata_budaya.map(i => ({ ...i, category: "Wisata Budaya" })),
    ...tourismData.hotels.map(i => ({ ...i, category: "Akomodasi" })),
    ...tourismData.restaurants.map(i => ({ ...i, category: "Kuliner" })),
  ], []);

  const item   = useMemo(() => allItems.find(i => i.id === id), [allItems, id]);
  const related = useMemo(() =>
    !item ? [] : allItems.filter(i => i.category === item.category && i.id !== item.id && i.active !== false).slice(0, 4),
    [allItems, item]
  );
  const mapItems = useMemo(() => item ? [item] : [], [item]);

  useEffect(() => {
    if (!item) return;
    const catKeyword = item.category.split(" ").pop() || "";
    fetch("/api/gallery")
      .then(r => r.json())
      .then((data: GalleryItem[]) => {
        if (!Array.isArray(data)) return;
        const filtered = data.filter(g =>
          g.category.toLowerCase().includes(catKeyword.toLowerCase())
        ).slice(0, 8);
        setGallery(filtered.length >= 2 ? filtered : data.slice(0, 6));
      }).catch(() => {});
  }, [item]);

  if (!item) return notFound();

  const color    = CAT_COLOR[item.category]    ?? "#059669";
  const bg       = CAT_BG[item.category]       ?? "#ecfdf5";
  const icon     = CAT_ICON[item.category];
  const gradient = CAT_GRADIENT[item.category] ?? CAT_GRADIENT["Wisata Alam"];

  const waContact = item.contact
    ? `https://wa.me/62${item.contact.replace(/^0/, "")}?text=${encodeURIComponent("Halo, saya ingin mengetahui lebih lanjut tentang " + item.name + ".")}`
    : null;
  const pageUrl  = typeof window !== "undefined" ? window.location.href : "";
  const shareWA  = `https://wa.me/?text=${encodeURIComponent(item.name + " — Destinasi Lampung Timur\n" + pageUrl)}`;
  const shareX   = `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.name + " — Destinasi Wisata Lampung Timur")}&url=${encodeURIComponent(pageUrl)}`;
  const shareEmail = `mailto:?subject=${encodeURIComponent(item.name)}&body=${encodeURIComponent(item.name + "\n\n" + pageUrl)}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const prevPhoto = () => setPhotoIdx(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setPhotoIdx(i => (i + 1) % gallery.length);

  return (
    <div style={{ paddingBottom: "5rem" }}>

      {/* ── HERO ────────────────────────────── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "2.5rem" }}>
        <div style={{
          backgroundImage: `${gradient}, url('/Gallery/hero1.avif')`,
          backgroundSize: "cover", backgroundPosition: "center",
          borderRadius: "24px", overflow: "hidden", position: "relative", minHeight: "320px",
          display: "flex", alignItems: "flex-end",
        }}>
          {/* dot grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "5rem", paddingBottom: "2.5rem", width: "100%" }}>
            {/* Breadcrumb */}
            <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Beranda</Link>
              <ChevronRight size={12} />
              <Link href="/direktori" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Direktori Wisata</Link>
              <ChevronRight size={12} />
              <span style={{ color: "white", fontWeight: 600 }}>{item.name.length > 40 ? item.name.slice(0,40)+"…" : item.name}</span>
            </nav>

            {/* Category pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", backgroundColor: color, color: "white", padding: "0.3rem 0.9rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
              {icon} {item.category}
            </div>

            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.85rem)", fontWeight: 900, color: "white", lineHeight: 1.15, maxWidth: "780px", letterSpacing: "-0.02em", margin: "0 0 1.1rem", textShadow: "0 2px 16px rgba(0,0,0,0.35)" }}>
              {item.name}
            </h1>

            {/* Quick stats chips */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Chip icon={<MapPin size={13} />} text={`Kec. ${item.kecamatan}`} />
              {item.active !== false && <Chip icon={<CheckCircle2 size={13} />} text="Beroperasi" green />}
              {item.classification && <Chip icon={<Star size={13} />} text={item.classification} />}
              {item.rooms && <Chip icon={<BedDouble size={13} />} text={`${item.rooms} Kamar`} />}
              {item.capacity && <Chip icon={<Users size={13} />} text={`Kapasitas ${item.capacity}`} />}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* ── LEFT ─────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

            {/* Photo gallery strip */}
            {gallery.length > 0 && (
              <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", position: "relative", aspectRatio: "16/7", background: "#0f172a", cursor: "pointer" }} onClick={() => setLightbox(true)}>
                <img src={gallery[photoIdx]?.imageUrl} alt={gallery[photoIdx]?.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.3s" }} />
                {/* overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)" }} />
                {/* prev/next */}
                {gallery.length > 1 && (<>
                  <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={arrowBtn("left")}>
                    <ChevronLeft size={20} color="white" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={arrowBtn("right")}>
                    <CR size={20} color="white" />
                  </button>
                </>)}
                {/* dots */}
                {gallery.length > 1 && (
                  <div style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
                    {gallery.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setPhotoIdx(i); }} style={{ width: i === photoIdx ? "18px" : "7px", height: "7px", borderRadius: "4px", background: i === photoIdx ? "white" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", padding: 0, transition: "width 0.2s" }} />
                    ))}
                  </div>
                )}
                {/* gallery count badge */}
                <div style={{ position: "absolute", top: "0.85rem", right: "0.85rem", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "8px", padding: "0.3rem 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "white", fontSize: "0.72rem", fontWeight: 700 }}>
                  <Images size={12} /> {photoIdx + 1} / {gallery.length}
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
                {gallery.map((g, i) => (
                  <button key={g.id} onClick={() => setPhotoIdx(i)} style={{ flexShrink: 0, width: "72px", height: "56px", borderRadius: "8px", overflow: "hidden", border: `2px solid ${i === photoIdx ? color : "transparent"}`, padding: 0, cursor: "pointer", transition: "border-color 0.15s", background: "none" }}>
                    <img src={g.imageUrl} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "2px solid var(--border)", gap: "0" }}>
              {([["info","Informasi"], ["fasilitas","Fasilitas"], ["peta","Peta Lokasi"]] as [Tab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: tab === t ? color : "var(--text-secondary)", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${color}` : "2px solid transparent", marginBottom: "-2px", cursor: "pointer", transition: "color 0.15s", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {t === "info" && <Info size={14} />}
                  {t === "fasilitas" && <CheckCircle2 size={14} />}
                  {t === "peta" && <Map size={14} />}
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Informasi */}
            {tab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.85rem" }}>
                  <InfoCard label="Kecamatan" value={item.kecamatan} accent={color} />
                  <InfoCard label="Kategori" value={item.category} accent={color} />
                  {item.classification && <InfoCard label="Klasifikasi" value={item.classification} accent={color} />}
                  {item.food_type && <InfoCard label="Jenis Masakan" value={item.food_type} accent={color} icon={<Utensils size={14} />} />}
                  {item.rooms && <InfoCard label="Jumlah Kamar" value={`${item.rooms} kamar`} accent={color} icon={<BedDouble size={14} />} />}
                  {item.capacity && <InfoCard label="Kapasitas" value={`${item.capacity} orang`} accent={color} icon={<Users size={14} />} />}
                </div>
                {item.address && (
                  <div style={{ padding: "1.1rem 1.35rem", background: bg, borderRadius: "14px", border: `1px solid ${color}22`, display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <MapPin size={18} style={{ color, flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: "0 0 0.2rem", fontSize: "0.7rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>Alamat Lengkap</p>
                      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>{item.address}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Fasilitas */}
            {tab === "fasilitas" && (
              <div>
                {item.facilities && item.facilities.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.7rem" }}>
                    {item.facilities.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", background: bg, border: `1px solid ${color}22`, borderRadius: "12px" }}>
                        <CheckCircle2 size={16} style={{ color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={36} style={{ opacity: 0.25, marginBottom: "0.75rem" }} />
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>Data fasilitas belum tersedia.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Peta */}
            {tab === "peta" && item.lat && item.lng && (
              <div style={{ borderRadius: "16px", overflow: "hidden", height: "380px", border: "1px solid var(--border)" }}>
                <MapComponent items={mapItems} selectedItem={item} onSelectItem={() => {}} />
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", position: "sticky", top: "96px" }}>

            {/* Action buttons */}
            <div style={{ background: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>Hubungi & Kunjungi</h3>

              {item.map_link && (
                <a href={item.map_link} target="_blank" rel="noopener noreferrer" style={actionBtn(color)}>
                  <ExternalLink size={16} /> Buka di Google Maps
                </a>
              )}
              {item.contact && (
                <a href={`tel:${item.contact}`} style={actionBtn("#0f172a")}>
                  <Phone size={16} /> {item.contact}
                </a>
              )}
              {waContact && (
                <a href={waContact} target="_blank" rel="noopener noreferrer" style={actionBtn("#25D366")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat WhatsApp
                </a>
              )}
            </div>

            {/* Share icons */}
            <div style={{ background: "white", borderRadius: "20px", padding: "1.25rem 1.5rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 0.85rem", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Share2 size={13} /> Bagikan
              </p>
              <div style={{ display: "flex", gap: "0.55rem" }}>
                <a href={shareWA} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={sIcon("#25D366")}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href={shareX} target="_blank" rel="noopener noreferrer" title="X (Twitter)" style={sIcon("#000")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={shareEmail} title="Email" style={sIcon("#6366f1")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                </a>
                <button onClick={copyUrl} title={copied ? "Disalin!" : "Salin URL"} style={{ ...sIcon(copied ? "#059669" : "#64748b"), border: "none", cursor: "pointer" }}>
                  {copied ? <Check size={15} color="white" /> : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                </button>
                {copied && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669", alignSelf: "center" }}>Disalin!</span>}
              </div>
            </div>

            {/* Map mini */}
            {item.lat && item.lng && (
              <div style={{ borderRadius: "16px", overflow: "hidden", height: "180px", border: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setTab("peta")}>
                <MapComponent items={mapItems} selectedItem={item} onSelectItem={() => {}} />
              </div>
            )}

            {/* Back */}
            <Link href="/direktori" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem 1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "white", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              <ArrowLeft size={14} /> Kembali ke Direktori
            </Link>
          </div>
        </div>

        {/* ── Related destinations ── */}
        {related.length > 0 && (
          <div style={{ marginTop: "3.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", margin: "0 0 1.5rem", display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <span style={{ width: "30px", height: "30px", borderRadius: "9px", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
              Destinasi {item.category} Lainnya
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {related.map(r => (
                <Link key={r.id} href={`/direktori/${r.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = "translateY(-4px)"; t.style.boxShadow = "0 16px 32px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = ""; t.style.boxShadow = "var(--card-shadow)"; }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 800, color, background: bg, padding: "0.2rem 0.6rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.category}</div>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.4rem", lineHeight: 1.3 }}>{r.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={12} style={{ flexShrink: 0 }} /> Kec. {r.kecamatan}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && gallery.length > 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLightbox(false)}>
          <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={{ ...arrowBtn("left"), position: "fixed", left: "1rem" }}>
            <ChevronLeft size={24} color="white" />
          </button>
          <img src={gallery[photoIdx]?.imageUrl} alt={gallery[photoIdx]?.title} style={{ maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "12px" }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={{ ...arrowBtn("right"), position: "fixed", right: "1rem" }}>
            <CR size={24} color="white" />
          </button>
          <button onClick={() => setLightbox(false)} style={{ position: "fixed", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={20} color="white" />
          </button>
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", fontWeight: 700 }}>
            {gallery[photoIdx]?.title} · {photoIdx + 1} / {gallery.length}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Helper components & styles ────────────────── */
function Chip({ icon, text, green }: { icon: React.ReactNode; text: string; green?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: green ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: green ? "#6ee7b7" : "rgba(255,255,255,0.9)", padding: "0.3rem 0.85rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${green ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.2)"}` }}>
      {icon} {text}
    </div>
  );
}

function InfoCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "1.1rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", borderTop: `3px solid ${accent}` }}>
      <p style={{ margin: "0 0 0.3rem", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
        {icon} {label}
      </p>
      <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>{value}</p>
    </div>
  );
}

function arrowBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", [side]: "0.75rem",
    transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(6px)", border: "none", borderRadius: "50%",
    width: "38px", height: "38px", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", zIndex: 2,
  };
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: "0.6rem",
    padding: "0.8rem 1rem", borderRadius: "12px", backgroundColor: bg,
    color: "white", fontWeight: 700, fontSize: "0.88rem",
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
