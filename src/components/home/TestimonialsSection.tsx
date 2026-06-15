"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const defaultTestimonials = [
  {
    name: "Budi Santoso",
    role: "Wisatawan Asal Jakarta",
    comment: "Mengunjungi Way Kambas adalah impian masa kecil saya. Melihat gajah dirawat dengan baik di habitat aslinya sungguh mengharukan. Pelayanan pemandu lokal sangat ramah!",
    rating: 5,
    avatar: "B"
  },
  {
    name: "Siti Rahma",
    role: "Fotografer & Traveler",
    comment: "Pantai Kerang Mas sangat bersih dengan fasilitas gazebo yang memadai. Sunrise di sini salah satu yang terbaik di Lampung. Sangat direkomendasikan untuk liburan keluarga.",
    rating: 5,
    avatar: "S"
  },
  {
    name: "David Miller",
    role: "Turis Asing (Australia)",
    comment: "Pugung Raharjo archeological site is a hidden gem! The prehistoric pyramids (punden berundak) are fascinating. A must-visit place for history lovers.",
    rating: 4,
    avatar: "D"
  }
];

export default function TestimonialsSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-secondary)", padding: "4rem 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)", marginBottom: "0.5rem" }}>
            Apa Kata Wisatawan?
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto" }}>
            Ulasan langsung dari para pelancong lokal dan mancanegara yang telah mengunjungi berbagai destinasi di Lampung Timur.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {defaultTestimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem", justifyContent: "space-between", height: "100%", backgroundColor: "white" }}
            >
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < test.rating ? "var(--accent)" : "none"}
                    color="var(--accent)"
                  />
                ))}
              </div>
              <p style={{ fontSize: "0.95rem", fontStyle: "italic", lineHeight: "1.7", color: "var(--text-secondary)", flexGrow: 1 }}>
                "{test.comment}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem"
                }}>
                  {test.avatar}
                </div>
                <div>
                  <h5 style={{ fontWeight: 800, fontSize: "0.95rem" }}>{test.name}</h5>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{test.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
