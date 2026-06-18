"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Sparkles, Compass, Award, Users, ChevronRight, ArrowRight } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

const bidangList = [
  {
    id: "sekretariat",
    title: "Sekretariat",
    icon: Briefcase,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    tagline: "Pusat Pelayanan Administrasi & Operasional Dinas",
    desc: "Mengelola administrasi, keuangan, kepegawaian, dan koordinasi operasional seluruh unit dinas secara transparan dan akuntabel.",
    highlights: ["Manajemen Keuangan & Anggaran", "Pembinaan Kepegawaian ASN", "Digitalisasi Arsip Dinas"],
  },
  {
    id: "ekonomi-kreatif",
    title: "Ekonomi Kreatif",
    icon: Sparkles,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    tagline: "Inovasi & Pemberdayaan Industri Kreatif Lokal",
    desc: "Memberdayakan pelaku ekraf lokal — dari kain tapis, kuliner, hingga konten digital — melalui pelatihan, pameran, dan fasilitasi sertifikasi.",
    highlights: ["Festival UMKM & Gelar Produk", "Pelatihan Digital Marketing", "Sertifikasi Halal & BPOM"],
  },
  {
    id: "pariwisata",
    title: "Pariwisata",
    icon: Compass,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    tagline: "Pengembangan Destinasi & Pemasaran Wisata Unggulan",
    desc: "Mengembangkan dan mempromosikan 71+ destinasi wisata Lampung Timur — dari Way Kambas hingga pantai pesisir timur — menuju destinasi unggulan nasional.",
    highlights: ["Pengembangan Desa Wisata", "Calendar of Events Tahunan", "Sertifikasi Pramuwisata"],
  },
  {
    id: "olahraga",
    title: "Keolahragaan",
    icon: Award,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    tagline: "Pembinaan Atlet Prestasi & Peningkatan Kebugaran Masyarakat",
    desc: "Melahirkan atlet berprestasi Lampung Timur melalui pembinaan sistematis, sekaligus menggerakkan budaya hidup sehat di seluruh lapisan masyarakat.",
    highlights: ["Penyelenggaraan PORKAB", "Program PELATDA Atlet", "Rehab Sarana Olahraga"],
  },
  {
    id: "pemuda",
    title: "Kepemudaan",
    icon: Users,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    tagline: "Kepemimpinan, Kewirausahaan, & Kemandirian Pemuda",
    desc: "Menumbuhkan generasi muda Lampung Timur yang berkarakter dan mandiri melalui pelatihan kepemimpinan, wirausaha, dan organisasi kepemudaan.",
    highlights: ["Diklat Kepemimpinan Pemuda", "Pemuda Pelopor Berprestasi", "Karang Taruna Wirausaha"],
  },
];

export default function BidangPage() {
  return (
    <div style={{ paddingBottom: "6rem" }}>

      {/* ── HERO ── */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3.5rem" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero1.avif')",
          backgroundSize: "cover", backgroundPosition: "center",
          minHeight: "380px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(190,242,106,0.15)", border: "1px solid rgba(190,242,106,0.3)", borderRadius: "99px", padding: "5px 14px", marginBottom: "1.25rem" }}>
                <Briefcase size={13} style={{ color: "#BEF26A" }} />
                <span style={{ color: "#BEF26A", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Struktur Organisasi</span>
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, color: "white", lineHeight: 1.15, maxWidth: "620px", letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Bidang &amp; Layanan Dinas
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ fontSize: "clamp(0.88rem, 1.5vw, 1rem)", color: "#d1fae5", maxWidth: "560px", lineHeight: 1.8, margin: 0 }}>
              DISPARPORA Lampung Timur menaungi lima bidang pelayanan masyarakat — mulai dari pengembangan pariwisata, pemberdayaan ekonomi kreatif, pembinaan kepemudaan, hingga prestasi keolahragaan.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>

        {/* Counter row */}
        <motion.div {...fadeUp(0)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {[
            { value: "5", label: "Bidang Teknis", sub: "Unit struktural aktif" },
            { value: "71+", label: "Destinasi Wisata", sub: "Terdaftar & aktif" },
            { value: "500+", label: "Pelaku Ekraf", sub: "Terbina aktif" },
            { value: "2.000+", label: "Pemuda Terbina", sub: "Melalui berbagai program" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.25rem", textAlign: "center", boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0E9F4F" }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginTop: "0.3rem" }}>{s.label}</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Bidang Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {bidangList.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div key={b.id} {...fadeUp(i * 0.08)} style={{
                background: "white", borderRadius: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)",
                padding: "2rem 2.5rem",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "1.75rem",
                alignItems: "center",
              }} className="bidang-page-card">
                {/* Icon */}
                <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: b.bg, display: "flex", alignItems: "center", justifyContent: "center", color: b.color, flexShrink: 0 }}>
                  <Icon size={28} />
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>Bidang {b.title}</h3>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: b.color, background: b.bg, padding: "2px 10px", borderRadius: "99px", border: `1px solid ${b.color}30` }}>{b.tagline.split(" ").slice(0, 3).join(" ")}</span>
                  </div>
                  <p style={{ margin: "0 0 0.85rem", fontSize: "0.88rem", color: "#475569", lineHeight: 1.65 }}>{b.desc}</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {b.highlights.map((h, j) => (
                      <span key={j} style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", background: "#f1f5f9", borderRadius: "99px", padding: "3px 10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ChevronRight size={10} style={{ color: b.color }} /> {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link href={`/bidang/${b.id}`} style={{
                  flexShrink: 0, padding: "0.65rem 1.25rem",
                  borderRadius: "12px", background: b.color,
                  color: "white", fontWeight: 700, fontSize: "0.85rem",
                  textDecoration: "none", display: "flex", alignItems: "center",
                  gap: "6px", whiteSpace: "nowrap",
                  boxShadow: `0 8px 20px -8px ${b.color}80`,
                }}>
                  Selengkapnya <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .bidang-page-card {
            grid-template-columns: auto 1fr !important;
            grid-template-rows: auto auto !important;
            padding: 1.25rem !important;
            gap: 1rem !important;
          }
          .bidang-page-card > a {
            grid-column: 1 / -1 !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
