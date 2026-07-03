"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const row1Items = [
  { title: "Panorama Alam Lampung Timur", category: "Alam & Lingkungan",    image: "/Gallery/hero1.avif",  width: "300px" },
  { title: "Keindahan Destinasi Wisata",  category: "Destinasi Unggulan",   image: "/Gallery/1.avif",      width: "340px" },
  { title: "Pesona Wisata Daerah",        category: "Lampung Timur",         image: "/Gallery/2.avif",      width: "270px" },
  { title: "Pantai Dewi Mandapa",         category: "Wisata Bahari",         image: "/Gallery/Pantai Dewi Mandapa.avif", width: "320px" },
  { title: "Keasrian Alam Terbuka",       category: "Ekowisata",             image: "/Gallery/3.avif",      width: "290px" },
  { title: "Air Terjun Way Guruh",        category: "Wisata Alam",           image: "/Gallery/Way Guruh.avif", width: "310px" },
  { title: "Wisata Budaya Lampung Timur", category: "Budaya & Tradisi",      image: "/Gallery/image.avif",   width: "280px" },
];

const row2Items = [
  { title: "Pantai Kerang Mas",           category: "Labuhan Maringgai",     image: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif", width: "340px" },
  { title: "Atraksi Budaya Lokal",        category: "Budaya & Seni",         image: "/Gallery/4.avif",       width: "280px" },
  { title: "Situs Candi Lampung Timur",   category: "Wisata Sejarah",        image: "/Gallery/5.avif",      width: "320px" },
  { title: "Pesona Alam Liar",            category: "Way Kambas",            image: "/Gallery/hero3.avif",   width: "330px" },
  { title: "Destinasi Wisata Unggulan",   category: "Lampung Timur",         image: "/Gallery/image copy.avif",   width: "290px" },
  { title: "Keindahan Alam Daerah",       category: "Pariwisata Daerah",     image: "/Gallery/image copy 2.avif", width: "310px" },
];

const imageVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 50,
    x: i % 2 === 0 ? -25 : 25,
    rotate: i % 2 === 0 ? -3 : 3,
    scale: 0.96
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      delay: (i % 6) * 0.08,
      duration: 0.75,
      ease: [0.25, 0.8, 0.25, 1] as [number, number, number, number]
    }
  })
};

export default function GallerySection() {
  const [dbGallery, setDbGallery] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbGallery(data);
        }
      })
      .catch(err => console.error("Error loading gallery:", err));
  }, []);

  const widths = ["300px", "340px", "270px", "320px", "290px", "310px", "280px", "340px", "330px"];

  // Pad helper to make sure the row is long enough for seamless infinite scroll
  const padRow = (items: any[], minLength = 12) => {
    if (items.length === 0) return [];
    let result = [...items];
    while (result.length < minLength) {
      result = [...result, ...items];
    }
    return result;
  };

  let activeRow1 = padRow(row1Items, 12);
  let activeRow2 = padRow(row2Items, 12);

  if (dbGallery.length > 0) {
    const formatted = dbGallery.map((g, idx) => ({
      title: g.title,
      category: g.category || "Galeri",
      image: g.imageUrl,
      width: widths[idx % widths.length]
    }));

    const r1 = formatted.filter((_, i) => i % 2 === 0);
    const r2 = formatted.filter((_, i) => i % 2 !== 0);

    activeRow1 = padRow(r1, 12);
    activeRow2 = padRow(r2, 12);
  }

  const extendedRow1 = [...activeRow1, ...activeRow1];
  const extendedRow2 = [...activeRow2, ...activeRow2];

  // Constant speed calculation: e.g. 7.5 seconds per card
  const duration1 = activeRow1.length * 7.5;
  const duration2 = activeRow2.length * 7.5;

  return (
    <section id="galeri" style={{ padding: "5rem 0", backgroundColor: "white", overflow: "hidden" }}>
      <motion.div
        className="container"
        style={{ textAlign: "center", marginBottom: "1.5rem" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}>Galeri Foto</h2>
        <p style={{ margin: "1.25rem auto 0 auto" }}>
          Dokumentasi keindahan alam liar, cagar budaya, kehidupan satwa, serta pesona wisata bahari Lampung Timur.
        </p>
      </motion.div>

      <div className="marquee-container">
        {/* Row 1: Scrolling Left */}
        <div className="marquee-row">
          <div className="marquee-track-left" style={{ animationDuration: `${duration1}s` }}>
            {extendedRow1.map((item, index) => (
              <motion.div
                key={`row1-${item.title}-${index}`}
                custom={index}
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{
                  width: item.width,
                  height: "200px",
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.08)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
                  padding: "1.25rem",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}>
                    {item.category}
                  </span>
                  <h4 style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "white",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}>{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-row">
          <div className="marquee-track-right" style={{ animationDuration: `${duration2}s` }}>
            {extendedRow2.map((item, index) => (
              <motion.div
                key={`row2-${item.title}-${index}`}
                custom={index}
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{
                  width: item.width,
                  height: "200px",
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.08)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
                  padding: "1.25rem",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}>
                    {item.category}
                  </span>
                  <h4 style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "white",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}>{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
