"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, ExternalLink, ChevronRight, CheckCircle2, Map, ArrowLeft, Utensils, Hotel, TreePine, Landmark, Milestone, Users, BedDouble } from "lucide-react";
import dynamic from "next/dynamic";
import tourismData from "@/data/tourism.json";
import { MapSkeleton } from "@/components/Skeleton";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const CATEGORY_COLORS: Record<string, string> = {
  "Wisata Alam":   "#059669",
  "Wisata Buatan": "#d97706",
  "Wisata Budaya": "#8b5cf6",
  "Akomodasi":     "#3b82f6",
  "Kuliner":       "#ec4899",
};
const CATEGORY_BG: Record<string, string> = {
  "Wisata Alam":   "#ecfdf5",
  "Wisata Buatan": "#fffbeb",
  "Wisata Budaya": "#f5f3ff",
  "Akomodasi":     "#eff6ff",
  "Kuliner":       "#fdf2f8",
};
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Wisata Alam":   <TreePine size={18} />,
  "Wisata Buatan": <Milestone size={18} />,
  "Wisata Budaya": <Landmark size={18} />,
  "Akomodasi":     <Hotel size={18} />,
  "Kuliner":       <Utensils size={18} />,
};

interface TourismItem {
  id: string;
  name: string;
  kecamatan: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
  active?: boolean;
  facilities?: string[];
  contact?: string;
  map_link?: string;
  classification?: string;
  rooms?: number;
  food_type?: string;
  capacity?: number;
}

export default function DestinationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const allItems = useMemo<TourismItem[]>(() => [
    ...tourismData.wisata_alam.map(i => ({ ...i, category: "Wisata Alam" })),
    ...tourismData.wisata_buatan.map(i => ({ ...i, category: "Wisata Buatan" })),
    ...tourismData.wisata_budaya.map(i => ({ ...i, category: "Wisata Budaya" })),
    ...tourismData.hotels.map(i => ({ ...i, category: "Akomodasi" })),
    ...tourismData.restaurants.map(i => ({ ...i, category: "Kuliner" })),
  ], []);

  const item = useMemo(() => allItems.find(i => i.id === id), [allItems, id]);

  if (!item) return notFound();

  const color = CATEGORY_COLORS[item.category] ?? "#059669";
  const bg    = CATEGORY_BG[item.category]    ?? "#ecfdf5";
  const icon  = CATEGORY_ICONS[item.category];

  // Related: same category, different id, max 4
  const related = useMemo(() =>
    allItems.filter(i => i.category === item.category && i.id !== item.id && i.active !== false).slice(0, 4),
    [allItems, item]
  );

  const mapItems = useMemo(() => [item], [item]);

  const waText = encodeURIComponent(`Halo, saya ingin mengetahui lebih lanjut tentang ${item.name} di Lampung Timur.`);

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* ── Hero ── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "2.5rem" }}>
        <div className="page-hero-inner" style={{
          backgroundImage: `linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero1.avif')`,
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", alignItems: "center", borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#a7f3d0", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "#a7f3d0", textDecoration: "none" }}>Beranda</Link>
              <ChevronRight size={12} />
              <Link href="/direktori" style={{ color: "#a7f3d0", textDecoration: "none" }}>Direktori</Link>
              <ChevronRight size={12} />
              <span style={{ color: "white", fontWeight: 600 }}>{item.name}</span>
            </div>

            {/* Category pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: color, color: "white", padding: "0.35rem 1rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {icon}
              {item.category}
            </div>

            <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.75rem)", fontWeight: 900, color: "white", lineHeight: 1.2, maxWidth: "700px", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.3)", margin: "0 0 1rem" }}>
              {item.name}
            </h1>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#d1fae5", fontSize: "0.9rem" }}>
                <MapPin size={15} /> {item.address || `Kec. ${item.kecamatan}`}
              </span>
              {item.active !== false && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#6ee7b7", fontSize: "0.85rem", fontWeight: 700 }}>
                  <CheckCircle2 size={14} /> Aktif & Beroperasi
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }} className="detail-grid">

          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Info cards row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>Kecamatan</p>
                <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{item.kecamatan}</p>
              </div>
              {item.rooms && (
                <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>Jumlah Kamar</p>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}><BedDouble size={16} style={{ color: "#3b82f6" }} /> {item.rooms} kamar</p>
                </div>
              )}
              {item.capacity && (
                <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>Kapasitas</p>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}><Users size={16} style={{ color: "#ec4899" }} /> {item.capacity} orang</p>
                </div>
              )}
              {item.classification && (
                <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>Klasifikasi</p>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{item.classification}</p>
                </div>
              )}
              {item.food_type && (
                <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.35rem" }}>Jenis Masakan</p>
                  <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}><Utensils size={16} style={{ color: "#ec4899" }} /> {item.food_type}</p>
                </div>
              )}
            </div>

            {/* Facilities */}
            {item.facilities && item.facilities.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
                  Fasilitas Tersedia
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.6rem" }}>
                  {item.facilities.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", color: "#334155" }}>
                      <CheckCircle2 size={15} style={{ color, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map preview */}
            {item.lat && item.lng && (
              <div style={{ background: "white", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Map size={15} /></span>
                  Lokasi di Peta
                </h2>
                <div style={{ borderRadius: "14px", overflow: "hidden", height: "280px" }}>
                  <MapComponent items={mapItems} selectedItem={item} onSelectItem={() => {}} />
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "sticky", top: "96px" }}>

            {/* Contact card */}
            <div style={{ background: "white", borderRadius: "20px", padding: "1.75rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.25rem" }}>Informasi Kontak</h3>

              {item.contact && (
                <a href={`tel:${item.contact}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "0.75rem", textDecoration: "none", color: "#0f172a", fontSize: "0.9rem", fontWeight: 600 }}>
                  <Phone size={17} style={{ color: "#059669", flexShrink: 0 }} />
                  {item.contact}
                </a>
              )}

              {item.map_link && (
                <a href={item.map_link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem 1rem", borderRadius: "12px", backgroundColor: "#059669", color: "white", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", marginBottom: "0.75rem" }}>
                  <ExternalLink size={16} />
                  Buka Google Maps
                </a>
              )}

              {item.contact && (
                <a href={`https://wa.me/62${item.contact.replace(/^0/, "")}?text=${waText}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem 1rem", borderRadius: "12px", backgroundColor: "#25D366", color: "white", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat WhatsApp
                </a>
              )}
            </div>

            {/* Share card */}
            <div style={{ background: "white", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", margin: "0 0 0.85rem" }}>Bagikan</p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <a href={`https://wa.me/?text=${encodeURIComponent(item.name + " — " + (item.address || "Kec. " + item.kecamatan) + " | " + typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" style={shareBtn("#25D366")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WA
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.name + " — destinasi wisata Lampung Timur")}`} target="_blank" rel="noopener noreferrer" style={shareBtn("#000000")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </a>
                <button onClick={() => { if (typeof navigator !== "undefined") { navigator.clipboard.writeText(window.location.href); } }} style={{ ...shareBtn("#475569"), border: "none", cursor: "pointer" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Salin
                </button>
              </div>
            </div>

            {/* Back to directory */}
            <Link href="/direktori" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "white", justifyContent: "center" }}>
              <ArrowLeft size={15} /> Kembali ke Direktori
            </Link>
          </div>
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <div style={{ marginTop: "3rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
              Destinasi {item.category} Lainnya
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {related.map(r => (
                <Link key={r.id} href={`/direktori/${r.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.transform = "translateY(-3px)"; t.style.boxShadow = "0 12px 28px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.transform = ""; t.style.boxShadow = "var(--card-shadow)"; }}
                  >
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, color, background: bg, padding: "0.2rem 0.65rem", borderRadius: "9999px", display: "inline-block", marginBottom: "0.5rem", textTransform: "uppercase" }}>{r.category}</div>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.35rem", lineHeight: 1.3 }}>{r.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={12} style={{ flexShrink: 0 }} /> Kec. {r.kecamatan}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shareBtn(bg: string): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    padding: "0.45rem 0.9rem", borderRadius: "8px", backgroundColor: bg,
    color: "white", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none",
  };
}
