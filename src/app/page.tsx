"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithRetry } from "@/lib/api";

// Import modular homepage sub-components
import HeroSection from "@/components/home/HeroSection";
import PidatoSection from "@/components/home/PidatoSection";
import BidangSection from "@/components/home/BidangSection";
import GallerySection from "@/components/home/GallerySection";
import DestinationsSection from "@/components/home/DestinationsSection";
import EventsSection from "@/components/home/EventsSection";
import NewsSection from "@/components/home/NewsSection";
import PartnersSection from "@/components/home/PartnersSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CalloutSection from "@/components/home/CalloutSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import { NewsCardSkeleton, PartnersSkeleton } from "@/components/Skeleton";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  authorName: string;
  createdAt: string;
  status: string;
  tags: string;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] as [number, number, number, number] }
  }
};

export default function Home() {
  const [latestNews, setLatestNews] = useState<Post[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);

  // Fetch partners and latest published news (requesting 4 news items for the redesigned layout grid)
  useEffect(() => {
    fetchWithRetry("/api/partners")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data);
      })
      .catch(err => console.error("Error fetching partners:", err))
      .finally(() => setPartnersLoading(false));

    fetchWithRetry("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter only published ones and take the top 4
          const published = data.filter((p: Post) => p.status === "published").slice(0, 4);
          setLatestNews(published);
        }
      })
      .catch(err => console.error("Error fetching news:", err))
      .finally(() => setNewsLoading(false));
  }, []);

  return (
    <div className="home-sections" style={{ display: "flex", flexDirection: "column", gap: "5rem", paddingBottom: "5rem" }}>
      {/* 1. Hero Section (Animate internally) */}
      <HeroSection />

      {/* 2. Pidato Sambutan Kepala Daerah */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <PidatoSection />
      </motion.div>

      {/* 3. Bidang/Divisions Layanan (Internal Stagger from Left) */}
      <BidangSection />

      {/* 4. Destinasi Wisata Populer (Internal Stagger from Right) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <DestinationsSection />
      </motion.div>

      {/* 5. Statistik Kunjungan Wisata */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <StatisticsSection />
      </motion.div>

      {/* 6. Berita & Informasi Terbaru */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        {newsLoading ? (
          <section className="container">
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ width: "100px", height: "28px", borderRadius: "999px", background: "#e2e8f0", margin: "0 auto 0.75rem" }} className="skeleton" />
              <div style={{ width: "260px", height: "36px", borderRadius: "8px", background: "#e2e8f0", margin: "0 auto" }} className="skeleton" />
            </div>
            <NewsCardSkeleton />
          </section>
        ) : (
          <NewsSection posts={latestNews} />
        )}
      </motion.div>

      {/* 6. Galeri Visual (Internal Stagger from Bottom) */}
      <GallerySection />

      {/* 7. Agenda & Event Mendatang */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <EventsSection />
      </motion.div>

      {/* 8. Ulasan & Testimoni Pengunjung */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <TestimonialsSection />
      </motion.div>

      {/* 9. Partner Logo Marquee Slider */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        {partnersLoading ? (
          <section style={{ backgroundColor: "white", padding: "4rem 0 2rem 0" }}>
            <div className="container">
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{ width: "120px", height: "24px", borderRadius: "999px", background: "#e2e8f0", margin: "0 auto 0.75rem" }} className="skeleton" />
                <div style={{ width: "180px", height: "32px", borderRadius: "8px", background: "#e2e8f0", margin: "0 auto" }} className="skeleton" />
              </div>
              <PartnersSkeleton />
            </div>
          </section>
        ) : (
          <PartnersSection partners={partners} />
        )}
      </motion.div>

      {/* 10. Info Callout / Peta Interaktif */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-120px" }}
        variants={sectionVariants}
      >
        <CalloutSection />
      </motion.div>
    </div>
  );
}
