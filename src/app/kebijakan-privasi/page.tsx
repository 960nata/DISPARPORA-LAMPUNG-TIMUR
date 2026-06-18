"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Lock, Database, UserCheck, Bell, Mail, ChevronDown } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

const sections = [
  {
    icon: <Database size={22} />,
    title: "Informasi yang Kami Kumpulkan",
    content: [
      "Data identitas dasar seperti nama dan alamat email saat Anda menghubungi kami melalui formulir kontak.",
      "Data teknis seperti alamat IP, jenis browser, dan halaman yang dikunjungi untuk tujuan analitik penggunaan situs.",
      "Data lokasi umum (kota/provinsi) untuk membantu kami menyajikan informasi yang relevan secara geografis.",
      "Pesan dan pertanyaan yang Anda kirimkan melalui kanal komunikasi resmi DISPARPORA Lampung Timur.",
    ],
  },
  {
    icon: <Eye size={22} />,
    title: "Penggunaan Informasi",
    content: [
      "Merespons pertanyaan, keluhan, atau permohonan informasi yang Anda ajukan kepada kami.",
      "Meningkatkan kualitas layanan, konten, dan navigasi portal wisata secara berkelanjutan.",
      "Mengirimkan informasi agenda, event, dan berita pariwisata Lampung Timur bila Anda berlangganan.",
      "Memenuhi kewajiban hukum dan peraturan perundang-undangan yang berlaku di Republik Indonesia.",
      "Melindungi keamanan sistem dan mencegah penyalahgunaan layanan digital pemerintah.",
    ],
  },
  {
    icon: <Lock size={22} />,
    title: "Keamanan Data",
    content: [
      "Kami menerapkan enkripsi HTTPS di seluruh halaman portal untuk melindungi data dalam transmisi.",
      "Akses ke data pribadi dibatasi hanya untuk staf yang memiliki keperluan dinas yang sah.",
      "Sistem kami secara rutin diperbarui untuk menutup celah keamanan sesuai standar tata kelola TI pemerintah.",
      "Kami tidak menyimpan informasi kartu kredit atau data keuangan dalam bentuk apapun.",
    ],
  },
  {
    icon: <UserCheck size={22} />,
    title: "Hak Pengguna",
    content: [
      "Anda berhak mengakses, memperbaiki, atau meminta penghapusan data pribadi yang kami simpan.",
      "Anda dapat menarik persetujuan pengiriman informasi kapan saja dengan menghubungi kami.",
      "Anda berhak mengajukan pengaduan kepada otoritas perlindungan data yang berwenang.",
      "Permintaan terkait data Anda akan kami proses dalam waktu maksimal 14 hari kerja.",
    ],
  },
  {
    icon: <Bell size={22} />,
    title: "Cookie & Teknologi Pelacak",
    content: [
      "Portal ini menggunakan cookie sesi untuk mempertahankan preferensi navigasi Anda selama kunjungan.",
      "Cookie analitik digunakan untuk memahami pola penggunaan situs secara anonim dan agregat.",
      "Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.",
      "Kami tidak menggunakan cookie pihak ketiga untuk keperluan iklan atau profiling komersial.",
    ],
  },
];

export default function KebijakanPrivasiPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div style={{ paddingBottom: "6rem" }}>
      <style jsx global>{`
        @media (max-width: 480px) {
          .kebijakan-intro-box { padding: 1.25rem !important; gap: 0.75rem !important; }
          .kebijakan-intro-box > svg { width: 28px !important; height: 28px !important; }
          .accordion-body-content { padding-left: 1.25rem !important; }
          .kebijakan-cta-box { padding: 1.25rem !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3.5rem" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero1.avif')",
          backgroundSize: "cover", backgroundPosition: "center",
          minHeight: "340px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            <motion.div {...fadeUp(0)}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(190,242,106,0.15)", border: "1px solid rgba(190,242,106,0.3)", borderRadius: "99px", padding: "5px 14px", marginBottom: "1.25rem" }}>
                <ShieldCheck size={14} style={{ color: "#BEF26A" }} />
                <span style={{ color: "#BEF26A", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Privasi & Keamanan</span>
              </div>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)", fontWeight: 900, color: "white", lineHeight: 1.2, maxWidth: "600px", letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Kebijakan Privasi
            </motion.h1>
            <motion.p {...fadeUp(0.2)} style={{ fontSize: "clamp(0.9rem, 1.5vw, 1rem)", color: "#d1fae5", maxWidth: "540px", lineHeight: 1.75, margin: 0 }}>
              DISPARPORA Lampung Timur berkomitmen melindungi privasi dan keamanan informasi pribadi setiap pengunjung portal ini sesuai regulasi yang berlaku.
            </motion.p>
            <motion.p {...fadeUp(0.25)} style={{ marginTop: "1.25rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
              Terakhir diperbarui: 17 Juni 2026
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>

        {/* Intro */}
        <motion.div {...fadeUp(0)} className="kebijakan-intro-box" style={{
          background: "linear-gradient(120deg, #0C3B26, #0F5132)",
          borderRadius: "20px", padding: "2rem 2.5rem", marginBottom: "2.5rem",
          display: "flex", gap: "1.5rem", alignItems: "flex-start",
        }}>
          <ShieldCheck size={36} style={{ color: "#BEF26A", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.5rem" }}>Komitmen Kami terhadap Privasi Anda</h2>
            <p style={{ color: "#d1fae5", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
              Kebijakan privasi ini menjelaskan bagaimana Dinas Pariwisata, Pemuda, dan Olahraga (DISPARPORA) Kabupaten Lampung Timur mengumpulkan, menggunakan, dan melindungi informasi yang Anda berikan saat menggunakan portal resmi ini. Dengan mengakses situs ini, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
            </p>
          </div>
        </motion.div>

        {/* Accordion Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sections.map((sec, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: isOpen ? "1px solid #0E9F4F" : "1px solid #e2e8f0",
                  boxShadow: isOpen
                    ? "0 4px 20px -4px rgba(14,159,79,0.15)"
                    : "0 2px 12px -4px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                  transition: "border-color 0.25s, box-shadow 0.25s",
                }}
              >
                {/* Header (always visible, clickable) */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.25rem 1.75rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px",
                    background: isOpen
                      ? "linear-gradient(135deg, #0C3B26, #0F5132)"
                      : "linear-gradient(135deg, #1e293b, #334155)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isOpen ? "#BEF26A" : "#94a3b8",
                    flexShrink: 0,
                    transition: "background 0.25s, color 0.25s",
                  }}>
                    {sec.icon}
                  </div>
                  <h3 style={{
                    margin: 0, flex: 1,
                    fontSize: "1.0rem", fontWeight: 800,
                    color: isOpen ? "#0f172a" : "#334155",
                    transition: "color 0.25s",
                  }}>
                    {sec.title}
                  </h3>
                  <ChevronDown
                    size={20}
                    style={{
                      color: isOpen ? "#0E9F4F" : "#94a3b8",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease, color 0.25s",
                    }}
                  />
                </button>

                {/* Collapsible body */}
                <div
                  style={{
                    maxHeight: isOpen ? "600px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s ease, opacity 0.3s ease",
                  }}
                >
                  <div className="accordion-body-content" style={{ padding: "0 1.75rem 1.5rem 1.75rem", paddingLeft: "calc(1.75rem + 42px + 0.75rem)" }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {sec.content.map((item, j) => (
                        <li key={j} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0E9F4F", flexShrink: 0, marginTop: "0.55rem" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div {...fadeUp(0.3)} style={{
          marginTop: "2.5rem", borderRadius: "20px",
          border: "1px solid #e2e8f0", background: "#f8fafc",
          padding: "2rem 2.5rem", display: "flex", gap: "1rem", alignItems: "flex-start",
        }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(14,159,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E9F4F", flexShrink: 0 }}>
            <Mail size={20} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Pertanyaan Tentang Privasi?</h3>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", color: "#475569", lineHeight: 1.65 }}>
              Jika Anda memiliki pertanyaan atau kekhawatiran mengenai kebijakan privasi ini, silakan hubungi kami melalui:
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#0E9F4F", fontWeight: 700 }}>
              info@disparpora.lampungtimurkab.go.id &nbsp;·&nbsp; (0725) 625012
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
