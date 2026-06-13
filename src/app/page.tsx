"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  // Fetch partners and latest published news (requesting 4 news items for the redesigned layout grid)
  useEffect(() => {
    fetch("/api/partners")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data);
      })
      .catch(err => console.error("Error fetching partners:", err));

    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter only published ones and take the top 4
          const published = data.filter((p: Post) => p.status === "published").slice(0, 4);
          setLatestNews(published);
        }
      })
      .catch(err => console.error("Error fetching news:", err));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5rem", paddingBottom: "5rem" }}>
      {/* 1. Hero Section (Animate internally) */}
      <HeroSection />

      {/* 2. Pidato Sambutan Kepala Daerah */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <PidatoSection />
      </motion.div>

      {/* 3. Bidang/Divisions Layanan (Internal Stagger from Left) */}
      <BidangSection />

      {/* 4. Destinasi Wisata Populer (Internal Stagger from Right) */}
      <DestinationsSection />

      {/* 5. Berita & Informasi Terbaru */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <NewsSection posts={latestNews} />
      </motion.div>

      {/* 6. Galeri Visual (Internal Stagger from Bottom) */}
      <GallerySection />

      {/* 7. Agenda & Event Mendatang */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <EventsSection />
      </motion.div>

      {/* 8. Ulasan & Testimoni Pengunjung */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <TestimonialsSection />
      </motion.div>

      {/* 9. Partner Logo Marquee Slider */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <PartnersSection partners={partners} />
      </motion.div>

      {/* 10. Info Callout / Peta Interaktif */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={sectionVariants}
      >
        <CalloutSection />
      </motion.div>
    </div>
  );
}
