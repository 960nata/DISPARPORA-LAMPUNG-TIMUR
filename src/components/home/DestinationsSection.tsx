"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";

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
  const N = defaultHighlights.length; // 6
  // extendedHighlights is a 3-copy array to allow seamless infinite scrolling
  const extendedHighlights = [...defaultHighlights, ...defaultHighlights, ...defaultHighlights];
  
  const [currentIndex, setCurrentIndex] = useState(N);
  const [visibleCount, setVisibleCount] = useState(3);
  const [peekWidth, setPeekWidth] = useState("calc(100% - 10rem)");
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isResetting, setIsResetting] = useState(false);



  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1440) {
        setVisibleCount(6);
      } else if (w >= 1200) {
        setVisibleCount(5);
      } else if (w >= 992) {
        setVisibleCount(4);
      } else if (w >= 768) {
        setVisibleCount(3);
      } else if (w >= 600) {
        setVisibleCount(2);
      } else {
        // Mobile: 1 full card + ~1/3 of the next card peeking so it reads as swipeable
        setVisibleCount(1.35);
      }

      if (w < 600) {
        // Near full-width viewport, left-aligned card with peek on the right
        setPeekWidth("calc(100% - 1.5rem)");
      } else if (w < 1024) {
        setPeekWidth("calc(100% - 7rem)");
      } else {
        setPeekWidth("calc(100% - 10rem)");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    if (isResetting || !isTransitioning) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isResetting || !isTransitioning) return;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (currentIndex >= N * 2) {
      setIsResetting(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex - N);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (currentIndex < N) {
      setIsResetting(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex + N);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsResetting(false);
  }, [currentIndex, N]);

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        setIsResetting(false);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <section id="destinasi" style={{ padding: "5rem 0", backgroundColor: "white", overflow: "hidden" }}>
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
        {/* Mobile-only side arrows — overlaid on the carousel */}
        <button
          className="dest-arrow-side dest-arrow-side-prev"
          onClick={handlePrev}
          aria-label="Sebelumnya"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <button
          className="dest-arrow-side dest-arrow-side-next"
          onClick={handleNext}
          aria-label="Berikutnya"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        <div style={{ width: peekWidth, margin: "0 auto", overflow: "visible" }}>
          <div
            style={{ 
              display: "flex", 
              gap: "1.5rem", 
              transition: isTransitioning ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
              transform: `translateX(calc(-${currentIndex} * (100% + 1.5rem) / ${visibleCount}))`
            }}
          >
            {extendedHighlights.map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                className="dest-card"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "var(--card-shadow)",
                  minHeight: "360px",
                  cursor: "pointer",
                  flex: `0 0 calc((100% - (${visibleCount} - 1) * 1.5rem) / ${visibleCount})`,
                  boxSizing: "border-box"
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", zIndex: 1, transition: "transform 0.5s ease" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                
                <div style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(4px)",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  zIndex: 3,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  {item.category}
                </div>

                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                  zIndex: 2,
                  padding: "1.5rem",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem"
                }}>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", fontFamily: "var(--font-main)" }}>
                    {item.name}
                  </h3>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#cbd5e1" }}>
                    <span>{item.subTitle}</span>
                    <span>|</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <Star size={12} fill="var(--accent)" color="var(--accent)" />
                      <strong style={{ color: "white" }}>{item.rating}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#e2e8f0", marginTop: "0.25rem" }}>
                    <MapPin size={12} style={{ color: "#ef4444" }} />
                    <span>{item.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        <div className="dest-bottom-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/direktori" className="btn btn-primary cta-btn" style={{ padding: "0.75rem 2rem", borderRadius: "12px", border: "none" }}>
            Lihat semua wisata
          </Link>

          {/* Desktop-only bottom arrows */}
          <div className="dest-arrows-desktop" style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handlePrev}
              style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "background-color 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <button
              onClick={handleNext}
              style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "background-color 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
