"use client";

import { motion } from "framer-motion";

const row1Items = [
  { 
    title: "Konservasi Gajah Liar", 
    category: "Way Kambas", 
    image: "https://images.unsplash.com/photo-1505144248225-f42bc77a5f8e?auto=format&fit=crop&w=600&q=80", 
    width: "340px" 
  },
  { 
    title: "Sunrise Pesisir Timur", 
    category: "Pantai Kerang Mas", 
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80", 
    width: "420px" 
  },
  { 
    title: "Telaga Rekreasi Asri", 
    category: "Danau Kemuning", 
    image: "/danau_kemuning.png", 
    width: "290px" 
  },
  { 
    title: "Tenunan Tapis Tradisional", 
    category: "Ekonomi Kreatif", 
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80", 
    width: "380px" 
  },
  { 
    title: "Keasrian Way Jepara", 
    category: "Danau Way Jepara", 
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80", 
    width: "360px" 
  },
  { 
    title: "Agrowisata Raman Utara", 
    category: "Kecamatan Raman Utara", 
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80", 
    width: "310px" 
  },
  { 
    title: "Rumah Adat Melinting", 
    category: "Desa Tradisional Wana", 
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80", 
    width: "400px" 
  }
];

const row2Items = [
  { 
    title: "Situs Purbakala Megalitikum", 
    category: "Pugung Raharjo", 
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80", 
    width: "400px" 
  },
  { 
    title: "Ekowisata Jembatan Mangrove", 
    category: "Pantai Mutiara Baru", 
    image: "/pantai_mutiara.png", 
    width: "320px" 
  },
  { 
    title: "Hutan Mangrove Margasari", 
    category: "Margasari", 
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80", 
    width: "440px" 
  },
  { 
    title: "Kuliner Khas Lampung Timur", 
    category: "Raman Utara", 
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", 
    width: "300px" 
  },
  { 
    title: "Benteng Purbakala", 
    category: "Taman Purbakala", 
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80", 
    width: "370px" 
  },
  { 
    title: "Petualangan Kali Alam", 
    category: "Bandar Sribhawono", 
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80", 
    width: "350px" 
  },
  { 
    title: "Begawi Adat Melinting", 
    category: "Wisata Budaya", 
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80", 
    width: "410px" 
  }
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
  const extendedRow1 = [...row1Items, ...row1Items];
  const extendedRow2 = [...row2Items, ...row2Items];

  return (
    <section id="galeri" style={{ padding: "5rem 0", backgroundColor: "white", overflow: "hidden" }}>
      {/* Title & Header Row - Centered inside page container */}
      <motion.div 
        className="container" 
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="badge badge-success" style={{ marginBottom: "0.75rem" }}>Galeri Foto</span>
        <h2 style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}>Keindahan Visual Lampung Timur</h2>
        <p style={{ maxWidth: "600px", margin: "1.25rem auto 0 auto" }}>
          Dokumentasi keindahan alam liar, cagar budaya, kehidupan satwa, serta pesona wisata bahari Lampung Timur.
        </p>
      </motion.div>

      {/* Marquee Viewport Wrapper (Full bleed left to right) */}
      <div className="marquee-container">
        {/* Row 1: Scrolling Left */}
        <div className="marquee-row">
          <div className="marquee-track-left">
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
                  height: "280px",
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
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
                  padding: "1.25rem",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem"
                }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.category}
                  </span>
                  <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-row">
          <div className="marquee-track-right">
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
                  height: "280px",
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
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
                  padding: "1.25rem",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem"
                }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.category}
                  </span>
                  <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
