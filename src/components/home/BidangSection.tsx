"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BidangCard {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  number: string;
  image: string;
  link: string;
}

const bidangData: BidangCard[] = [
  {
    id: 1,
    title: "SEKRETARIAT",
    subtitle: "Administrasi & Kepegawaian",
    description: "Menyelenggarakan pelayanan administratif, perencanaan program kerja, pengelolaan administrasi keuangan, kepegawaian, serta urusan rumah tangga dinas secara terpadu.",
    number: "01",
    image: "/bidang_sekretariat.png",
    link: "/profil#sekretariat"
  },
  {
    id: 2,
    title: "EKONOMI KREATIF",
    subtitle: "Kriya, Kuliner & Digitalisasi",
    description: "Membina dan mengembangkan potensi industri kreatif daerah, memfasilitasi sertifikasi pelaku usaha, serta mendorong pemasaran produk kreatif lokal Lampung Timur.",
    number: "02",
    image: "/bidang_ekraf.png",
    link: "/profil#ekonomi-kreatif"
  },
  {
    id: 3,
    title: "PARIWISATA",
    subtitle: "Destinasi & Promosi Wisata",
    description: "Mengembangkan sarana prasarana destinasi wisata unggulan, meningkatkan kapasitas Pokdarwis, serta mempromosikan keindahan alam dan budaya daerah.",
    number: "03",
    image: "/bidang_pariwisata.png",
    link: "/profil#pariwisata"
  },
  {
    id: 4,
    title: "OLAHRAGA",
    subtitle: "Olahraga Prestasi & Rekreasi",
    description: "Meningkatkan prestasi olahraga daerah, memfasilitasi kompetisi atlet pemuda, serta memelihara sarana prasarana olahraga di Lampung Timur.",
    number: "04",
    image: "/bidang_olahraga.png",
    link: "/profil#olahraga"
  },
  {
    id: 5,
    title: "PEMUDA",
    subtitle: "Kepemimpinan & Organisasi",
    description: "Memberdayakan organisasi kepemudaan, menyelenggarakan pelatihan kepemimpinan dan kewirausahaan pemuda secara berkelanjutan.",
    number: "05",
    image: "/bidang_pemuda.png",
    link: "/profil#pemuda"
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const cardEntranceVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring" as const, 
      stiffness: 70, 
      damping: 14 
    }
  }
};

export default function BidangSection() {
  const [selectedCard, setSelectedCard] = useState<number>(1);

  return (
    <section className="container" id="bidang">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
      >
        <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}>5 Bidang & Layanan Dinas</h2>
        <p style={{ maxWidth: "600px", margin: "1.25rem auto 0 auto" }}>
          Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur menaungi lima bidang pelayanan masyarakat untuk pengembangan daerah.
        </p>
      </motion.div>

      <motion.div 
        className="bidang-accordion-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-100px" }}
      >
        {bidangData.map((card) => {
          const isActive = selectedCard === card.id;
          return (
            <motion.div
              key={card.id}
              variants={cardEntranceVariants}
              className={`bidang-accordion-card ${isActive ? "active" : ""}`}
              onClick={() => setSelectedCard(card.id)}
              onMouseEnter={() => setSelectedCard(card.id)}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(6, 78, 59, 0.75)",
                  transition: "opacity 0.5s ease",
                  opacity: isActive ? 0 : 1,
                  zIndex: 10
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(6, 78, 59, 0.95) 0%, rgba(6, 78, 59, 0.4) 60%, transparent 100%)",
                  transition: "opacity 0.5s ease",
                  opacity: isActive ? 1 : 0,
                  zIndex: 11
                }}
              />

              <div
                className="bidang-inactive-text"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  color: "white",
                  zIndex: 20,
                  pointerEvents: isActive ? "none" : "auto",
                  transition: "opacity 0.3s ease",
                  opacity: isActive ? 0 : 1
                }}
              >
                <div className="mobile-text-content" style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white" }}>{card.title}</h3>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, opacity: 0.3, color: "white" }}>{card.number}</div>
                </div>

                <div className="desktop-text-content" style={{ display: "none", flexDirection: "column", width: "100%", height: "100%", justifyContent: "space-between", alignItems: "center", padding: "2rem 1rem" }}>
                  <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", marginTop: "120px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.15em", color: "white" }}>{card.title}</h3>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, opacity: 0.3, color: "white" }}>{card.number}</div>
                </div>
              </div>

              <div
                className="bidang-active-details"
                style={{
                  position: "relative",
                  color: "white",
                  zIndex: 30,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "2rem",
                  boxSizing: "border-box",
                  transition: "all 0.5s ease",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(20px)",
                  pointerEvents: isActive ? "auto" : "none"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {card.subtitle}
                  </span>
                  <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", fontFamily: "var(--font-main)", margin: 0 }}>
                    {card.title}
                  </h4>
                  <p style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.6", margin: 0, maxWidth: "400px" }}>
                    {card.description}
                  </p>
                </div>
                <div>
                  <Link
                    href={card.link}
                    className="btn btn-accent"
                    style={{
                      padding: "0.6rem 1.5rem",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    Selengkapnya
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <style jsx global>{`
        .bidang-accordion-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
        }

        .bidang-accordion-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          cursor: pointer;
          height: 80px;
          width: 100%;
          transition: all 0.7s cubic-bezier(0.28, -0.03, 0, 0.99);
          box-shadow: var(--card-shadow);
        }

        .bidang-accordion-card.active {
          height: 320px;
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .bidang-accordion-container {
            flex-direction: row;
            height: 380px;
            justify-content: center;
          }
          .bidang-accordion-card {
            height: 380px;
            width: 100px;
          }
          .bidang-accordion-card.active {
            width: 300px;
            height: 380px;
          }
          .mobile-text-content {
            display: none !important;
          }
          .desktop-text-content {
            display: flex !important;
          }
        }

        @media (min-width: 1024px) {
          .bidang-accordion-container {
            flex-direction: row;
            height: 500px;
            justify-content: center;
          }
          .bidang-accordion-card {
            height: 500px;
            width: 150px;
          }
          .bidang-accordion-card.active {
            width: 480px;
            height: 500px;
          }
          .mobile-text-content {
            display: none !important;
          }
          .desktop-text-content {
            display: flex !important;
          }
        }
      `}</style>
    </section>
  );
}
