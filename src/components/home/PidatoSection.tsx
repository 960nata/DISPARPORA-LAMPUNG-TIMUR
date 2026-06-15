"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SpeechData {
  name: string;
  title: string;
  badge: string;
  photoUrl: string;
  welcomeSpeech: string;
}

const speeches: SpeechData[] = [
  {
    name: "Ela Siti Nuryamah",
    title: "Bupati Lampung Timur",
    badge: "Sambutan Bupati",
    photoUrl: "/leaders/bupati.png",
    welcomeSpeech: "Tabik Pun! Selamat datang di Portal Wisata resmi Kabupaten Lampung Timur. Kami mengundang seluruh wisatawan untuk datang dan menyaksikan sendiri kekayaan alam liar yang mempesona di Taman Nasional Way Kambas, keindahan bahari pantai pesisir timur, serta peninggalan prasejarah yang bernilai tinggi. Lampung Timur terus berinovasi dalam memajukan pemuda, olahraga, dan industri ekonomi kreatif lokal demi mewujudkan masyarakat yang sejahtera dan berbudaya."
  },
  {
    name: "Azwar Hadi",
    title: "Wakil Bupati Lampung Timur",
    badge: "Sambutan Wakil Bupati",
    photoUrl: "/leaders/wabup.png",
    welcomeSpeech: "Selamat datang di platform digital pariwisata, kepemudaan, dan olahraga Lampung Timur. Melalui sinergi yang kuat antara pengembangan pariwisata terpadu, pemberdayaan pemuda yang inovatif, serta pembinaan olahraga yang konsisten, kami bertekad membawa Lampung Timur menjadi daerah yang unggul dan berdaya saing. Mari jelajahi pesona alam kami dan rasakan kehangatan masyarakat Lampung Timur."
  },
  {
    name: "Marsan, S.Pd., Ing., M.Pd.",
    title: "Kepala Dinas Pariwisata, Kepemudaan dan Olahraga",
    badge: "Sambutan Kepala Dinas",
    photoUrl: "/leaders/kadis.png",
    welcomeSpeech: "Tabik Pun! Atas nama Dinas Pariwisata, Kepemudaan, dan Olahraga Kabupaten Lampung Timur, kami menyambut hangat kehadiran Anda di portal ini. Tugas kami adalah mengemas potensi alam, budaya, dan sejarah Lampung Timur menjadi destinasi wisata unggulan. Bersama pemuda-pemudi kreatif dan atlet yang tangguh, kami siap memfasilitasi kemajuan pariwisata dan olahraga demi masa depan Lampung Timur yang gemilang."
  }
];

export default function PidatoSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % speeches.length);
    }, 8000); // Auto-play every 8 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + speeches.length) % speeches.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % speeches.length);
  };

  const activeSpeech = speeches[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir < 0 ? 40 : -40,
      transition: { duration: 0.3, ease: "easeIn" as const }
    })
  };

  return (
    <section className="container" style={{ position: "relative" }}>
      {/* Local Responsive CSS */}
      <style>{`
        .desktop-nav-btn {
          display: flex !important;
        }
        .mobile-controls-row {
          display: none !important;
        }
        .speech-card {
          padding: 3.5rem 5rem !important;
        }
        @media (max-width: 992px) {
          .speech-card {
            padding: 3rem !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav-btn {
            display: none !important;
          }
          .mobile-controls-row {
            display: flex !important;
          }
          .speech-card {
            padding: 2rem !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="section-header-center" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)", marginBottom: "0.5rem" }}>
          Sambutan Kepala Daerah
        </h2>
        <p style={{ maxWidth: "600px", margin: "0 auto" }}>
          Sambutan hangat dari pimpinan Kabupaten Lampung Timur dan Dinas Pariwisata, Kepemudaan, dan Olahraga.
        </p>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div 
        className="card speech-card" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.03)",
          overflow: "hidden",
          minHeight: "440px",
          justifyContent: "center",
          borderRadius: "var(--border-radius)"
        }}
      >
        {/* Desktop Side Navigation - Left */}
        <button 
          onClick={handlePrev}
          className="desktop-nav-btn"
          style={{
            position: "absolute",
            left: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            zIndex: 10,
            transition: "all 0.2s ease",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          aria-label="Previous Speech"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Desktop Side Navigation - Right */}
        <button 
          onClick={handleNext}
          className="desktop-nav-btn"
          style={{
            position: "absolute",
            right: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            zIndex: 10,
            transition: "all 0.2s ease",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          aria-label="Next Speech"
        >
          <ChevronRight size={20} />
        </button>

        {/* Animated Carousel Contents */}
        <div style={{ position: "relative", width: "100%" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                display: "flex",
                gap: "3rem",
                flexWrap: "wrap",
                alignItems: "center",
                width: "100%"
              }}
            >
              {/* Leader Photo Column */}
              <div style={{ flex: "0 0 240px", display: "flex", justifyContent: "center", margin: "0 auto" }}>
                <div style={{ position: "relative", width: "240px", height: "300px" }}>
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    right: "-12px",
                    bottom: "-12px",
                    backgroundColor: "var(--primary-light)",
                    border: "2px dashed var(--primary)",
                    borderRadius: "20px",
                    zIndex: 1
                  }} />
                  <img
                    src={activeSpeech.photoUrl}
                    alt={activeSpeech.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "20px",
                      zIndex: 2,
                      position: "relative",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                      border: "4px solid white"
                    }}
                  />
                </div>
              </div>

              {/* Speech Text Column */}
              <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: "280px" }}>
                <span style={{ 
                  alignSelf: "flex-start",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "0.5rem 1rem",
                  borderRadius: "100px",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(5, 150, 105, 0.15)"
                }}>
                  {activeSpeech.badge}
                </span>
                <h3 style={{ 
                  fontSize: "1.85rem", 
                  fontWeight: 800, 
                  fontFamily: "var(--font-serif)",
                  color: "var(--text-primary)",
                  lineHeight: "1.3"
                }}>
                  Selamat Datang di Lampung Timur
                </h3>
                <p style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.85",
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                  borderLeft: "4px solid var(--primary)",
                  paddingLeft: "1.25rem",
                  position: "relative"
                }}>
                  "{activeSpeech.welcomeSpeech}"
                </p>
                <div style={{ marginTop: "0.5rem" }}>
                  <h5 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {activeSpeech.name}
                  </h5>
                  <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 700, marginTop: "0.25rem" }}>
                    {activeSpeech.title}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Control Row (Indicators & Mobile Buttons) — di bawah card */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        marginTop: "1.5rem",
        width: "100%",
        zIndex: 10
      }}>
        {/* Mobile Back Button */}
        <button
          onClick={handlePrev}
          className="mobile-controls-row"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            color: "var(--text-secondary)"
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Indicators (Dots) */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {speeches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              style={{
                width: currentIndex === idx ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: currentIndex === idx ? "var(--primary)" : "var(--border)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Mobile Next Button */}
        <button
          onClick={handleNext}
          className="mobile-controls-row"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "1px solid var(--border)",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            color: "var(--text-secondary)"
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

