"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Heart, ChevronRight } from "lucide-react";

const defaultHighlights = [
  {
    name: "Way Kambas",
    category: "Wisata Alam",
    image: "/Gallery/Taman Nasional Way Kambas.avif",
    subTitle: "Suaka Margasatwa",
    rating: "4.9 (2.1k)",
    location: "Labuhan Ratu",
    link: "/peta?id=nature_2"
  },
  {
    name: "Pantai Mutiara Baru",
    category: "Wisata Alam",
    image: "/pantai_mutiara.png",
    subTitle: "Konservasi Mangrove",
    rating: "4.8 (890)",
    location: "Labuhan Maringgai",
    link: "/peta?id=nature_3"
  },
  {
    name: "Pugung Raharjo",
    category: "Wisata Budaya",
    image: "/Gallery/pugung_raharjo.avif",
    subTitle: "Situs Purbakala",
    rating: "4.7 (950)",
    location: "Sekampung Udik",
    link: "/peta?id=culture_1"
  },
  {
    name: "Danau Kemuning",
    category: "Wisata Buatan",
    image: "/danau_kemuning.avif",
    subTitle: "Telaga Rekreasi Asri",
    rating: "4.7 (620)",
    location: "Bandar Sribhawono",
    link: "/peta?id=artificial_1"
  },
  {
    name: "Pantai Kerang Mas",
    category: "Wisata Alam",
    image: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif",
    subTitle: "Wisata Pesisir",
    rating: "4.8 (1.5k)",
    location: "Labuhan Maringgai",
    link: "/peta?id=nature_1"
  },
  {
    name: "Desa Wisata Wana",
    category: "Wisata Budaya",
    image: "/Gallery/nuwo_sesat.avif",
    subTitle: "Desa Adat Melinting",
    rating: "4.6 (780)",
    location: "Melinting",
    link: "/peta?id=culture_2"
  }
];

export default function DestinationsSection() {
  const N = defaultHighlights.length;
  const extendedHighlights = [...defaultHighlights, ...defaultHighlights, ...defaultHighlights];

  const [currentIndex, setCurrentIndex] = useState(N);
  const [visibleCount, setVisibleCount] = useState(3);
  const [peekWidth, setPeekWidth] = useState("calc(100% - 10rem)");
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1440) setVisibleCount(6);
      else if (w >= 1200) setVisibleCount(5);
      else if (w >= 992) setVisibleCount(4);
      else if (w >= 768) setVisibleCount(3);
      else if (w >= 600) setVisibleCount(2);
      else setVisibleCount(1.35);

      if (w < 600) setPeekWidth("calc(100% - 1.5rem)");
      else if (w < 1024) setPeekWidth("calc(100% - 7rem)");
      else setPeekWidth("calc(100% - 10rem)");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => { if (!isResetting && isTransitioning) setCurrentIndex(p => p - 1); };
  const handleNext = () => { if (!isResetting && isTransitioning) setCurrentIndex(p => p + 1); };

  useEffect(() => {
    if (currentIndex >= N * 2) {
      setIsResetting(true);
      const t = setTimeout(() => { setIsTransitioning(false); setCurrentIndex(currentIndex - N); }, 500);
      return () => clearTimeout(t);
    }
    if (currentIndex < N) {
      setIsResetting(true);
      const t = setTimeout(() => { setIsTransitioning(false); setCurrentIndex(currentIndex + N); }, 500);
      return () => clearTimeout(t);
    }
    setIsResetting(false);
  }, [currentIndex, N]);

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => { setIsTransitioning(true); setIsResetting(false); }, 20);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  return (
    <section id="destinasi" style={{ padding: "5rem 0", backgroundColor: "white", overflow: "hidden" }}>
      <style>{`
        .dest-see-btn:hover { background: #1e293b !important; }
        .dest-heart-btn:hover { background: rgba(255,255,255,1) !important; transform: scale(1.1); }
        .dest-see-overlay:hover { background: rgba(255,255,255,0.15) !important; }
      `}</style>

      <div className="container" style={{ marginBottom: "2rem" }}>
        <div className="dest-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ flex: "1 1 300px" }}>
            <h2 className="section-heading" style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-main)", letterSpacing: "-0.02em" }}>
              Destinasi Terpopuler
            </h2>
          </div>
          <div className="dest-section-desc" style={{ flex: "2 1 400px" }}>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: "1.7", margin: 0 }}>
              Jelajahi pilihan destinasi wisata terpopuler yang menjadi ikon keindahan alam dan budaya Lampung Timur.
            </p>
          </div>
        </div>
      </div>

      <div className="dest-carousel-wrap" style={{ width: "100%", overflow: "hidden", padding: "1rem 0", position: "relative" }}>
        {/* Mobile arrows */}
        <button className="dest-arrow-side dest-arrow-side-prev" onClick={handlePrev} aria-label="Sebelumnya">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <button className="dest-arrow-side dest-arrow-side-next" onClick={handleNext} aria-label="Berikutnya">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        <div style={{ width: peekWidth, margin: "0 auto", overflow: "visible" }}>
          <div style={{
            display: "flex", gap: "1.5rem",
            transition: isTransitioning ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
            transform: `translateX(calc(-${currentIndex} * (100% + 1.5rem) / ${visibleCount}))`
          }}>
            {extendedHighlights.map((item, index) => {
              const key = `${item.name}-${index}`;
              const isHovered = hoveredKey === key;

              return (
                <div
                  key={key}
                  className="dest-card"
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    position: "relative",
                    borderRadius: "24px",
                    minHeight: "380px",
                    cursor: "pointer",
                    flex: `0 0 calc((100% - (${visibleCount} - 1) * 1.5rem) / ${visibleCount})`,
                    boxSizing: "border-box",
                    background: "#fff",
                    boxShadow: isHovered
                      ? "0 24px 50px -12px rgba(0,0,0,0.3)"
                      : "0 4px 20px -4px rgba(0,0,0,0.1)",
                    transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                    transition: "box-shadow 0.35s ease, transform 0.35s ease",
                    overflow: "hidden",
                  }}
                >
                  {/* ── IMAGE ── */}
                  <div style={{
                    position: "absolute",
                    top: isHovered ? "8px" : 0,
                    left: isHovered ? "8px" : 0,
                    right: isHovered ? "8px" : 0,
                    bottom: isHovered ? "43%" : 0,
                    borderRadius: isHovered ? "18px" : "24px",
                    overflow: "hidden",
                    transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* Normal gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: isHovered
                        ? "none"
                        : "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)",
                      transition: "background 0.4s ease",
                    }} />
                  </div>

                  {/* ── HEART ── */}
                  <button className="dest-heart-btn" style={{
                    position: "absolute", top: "5%", right: "5%", zIndex: 10,
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(6px)", transition: "transform 0.2s ease, background 0.2s ease",
                  }} onClick={e => e.preventDefault()}>
                    <Heart size={15} style={{ color: "#065f46" }} />
                  </button>

                  {/* ── NORMAL OVERLAY CONTENT (full image state) ── */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5,
                    padding: "20px",
                    opacity: isHovered ? 0 : 1,
                    transform: isHovered ? "translateY(8px)" : "translateY(0)",
                    transition: "all 0.35s ease",
                    pointerEvents: isHovered ? "none" : "auto",
                  }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: "99px",
                      background: "rgba(255,255,255,0.18)", color: "#fff",
                      fontSize: "0.7rem", fontWeight: 700, marginBottom: "8px",
                      backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)",
                    }}>{item.category}</span>
                    <h3 style={{ margin: "0 0 2px", fontSize: "1.2rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                      {item.name}
                    </h3>
                    <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "rgba(255,255,255,0.75)" }}>
                      {item.subTitle}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>
                        <Star size={12} fill="#fbbf24" color="#fbbf24" /> {item.rating}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>
                        <MapPin size={12} style={{ color: "#f87171" }} /> {item.location}
                      </span>
                    </div>
                    <Link href={item.link} className="dest-see-overlay" style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "11px 14px", borderRadius: "14px",
                      background: "#fff", color: "#0f172a",
                      fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                      transition: "background 0.2s ease",
                    }}>
                      Jelajahi
                    </Link>
                  </div>

                  {/* ── HOVER CONTENT (white area below) ── */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: "43%", background: "#fff",
                    borderRadius: "0 0 24px 24px",
                    padding: "14px 16px 16px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    pointerEvents: isHovered ? "auto" : "none",
                    zIndex: 4,
                  }}>
                    <div>
                      <h3 style={{ margin: "0 0 2px", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                        {item.name}
                      </h3>
                      <p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "#64748b" }}>
                        {item.subTitle}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#475569" }}>
                          <Star size={11} fill="#fbbf24" color="#fbbf24" /> {item.rating}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#475569" }}>
                          <MapPin size={11} style={{ color: "#f87171" }} /> {item.location}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: button + heart */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                      <Link href={item.link} className="dest-see-btn" style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "9px 14px", borderRadius: "12px",
                        background: "#0f172a", color: "#fff",
                        fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
                        transition: "background 0.2s ease",
                      }}>
                        Jelajahi
                      </Link>
                      <button className="dest-heart-btn" style={{
                        width: "38px", height: "38px", borderRadius: "12px",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0,
                        transition: "transform 0.2s ease, background 0.2s ease",
                      }} onClick={e => e.preventDefault()}>
                        <Heart size={15} style={{ color: "#065f46" }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        <div className="dest-bottom-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/direktori" className="btn btn-primary cta-btn" style={{ padding: "0.75rem 2rem", borderRadius: "12px", border: "none" }}>
            Lihat semua wisata
          </Link>
          <div className="dest-arrows-desktop" style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handlePrev} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseOut={e => e.currentTarget.style.backgroundColor = "white"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <button onClick={handleNext} style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseOut={e => e.currentTarget.style.backgroundColor = "white"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
