"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  Users,
  ShieldCheck,
  Award,
  Scale,
  FileText,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Target,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, delay },
});

const kepalaDinas = {
  name: "Marsan, S.Pd., Ing., M.Pd.",
  role: "Kepala Dinas",
  unit: "DISPARPORA Lampung Timur",
  photo: "/leaders/kadis.avif",
};

const pejabatList = [
  { name: "Sekretariat", role: "Sekretaris Dinas", sub: "Administrasi & Operasional Dinas" },
  { name: "Bidang Pariwisata", role: "Kepala Bidang", sub: "Pengembangan Destinasi Wisata" },
  { name: "Bidang Ekonomi Kreatif", role: "Kepala Bidang", sub: "Industri & Kriya Kreatif" },
  { name: "Bidang Kepemudaan", role: "Kepala Bidang", sub: "Pemberdayaan Pemuda" },
  { name: "Bidang Keolahragaan", role: "Kepala Bidang", sub: "Pembinaan Prestasi Olahraga" },
];

const bidangDetails = [
  {
    id: "sekretariat",
    title: "Sekretariat",
    icon: <Briefcase size={28} />,
    color: "#3b82f6",
    tagline: "Pusat Pelayanan Administrasi & Operasional Dinas",
    tugas: [
      "Pengelolaan administrasi surat-menyurat dan kearsipan dinas.",
      "Penyusunan rencana kerja operasional, evaluasi, dan pelaporan kinerja tahunan.",
      "Pengelolaan keuangan dinas, anggaran belanja, pertanggungjawaban anggaran, dan audit.",
      "Pembinaan kepegawaian, disiplin kerja, mutasi, promosi, dan pengembangan karir staf.",
      "Koordinasi hubungan masyarakat (humas) dan dokumentasi kegiatan kedinasan.",
    ],
    program: [
      "Penyusunan Rencana Strategis (Renstra) Dinas jangka panjang.",
      "Program Digitalisasi Arsip & Persuratan Administrasi Kantor.",
      "Peningkatan Kapasitas SDM Aparatur Pemerintah Daerah.",
    ],
  },
  {
    id: "ekonomi-kreatif",
    title: "Ekonomi Kreatif",
    icon: <Sparkles size={28} />,
    color: "#ec4899",
    tagline: "Inovasi & Pemberdayaan Industri Kreatif Lokal",
    tugas: [
      "Identifikasi, pendataan, dan pemetaan potensi pelaku ekonomi kreatif di Lampung Timur.",
      "Pembinaan dan fasilitasi sertifikasi usaha industri kriya, fashion, kuliner, dan seni.",
      "Penyelenggaraan pameran produk ekonomi kreatif tingkat kabupaten, provinsi, dan nasional.",
      "Pelatihan kewirausahaan, manajemen produk, pemasaran digital, dan perlindungan HAKI.",
      "Pembangunan inkubator bisnis kreatif dan kemitraan dengan jejaring e-commerce.",
    ],
    program: [
      "Festival UMKM Kreatif & Gelar Produk Unggulan Lampung Timur.",
      "Pelatihan Digital Marketing dan E-Commerce untuk Pelaku Kriya & Kuliner.",
      "Sertifikasi Halal & BPOM Terfasilitasi untuk Industri Rumahan.",
    ],
  },
  {
    id: "pariwisata",
    title: "Pariwisata",
    icon: <Compass size={28} />,
    color: "#10b981",
    tagline: "Pengembangan Destinasi & Pemasaran Wisata Unggulan",
    tugas: [
      "Penyusunan rencana induk pengembangan pariwisata daerah (RIPPDA) Lampung Timur.",
      "Pembangunan sarana prasarana penunjang pariwisata (amenitas, aksesibilitas, rambu wisata).",
      "Promosi destinasi wisata unggulan melalui media cetak, digital, dan keikutsertaan expo.",
      "Pembinaan Kelompok Sadar Wisata (Pokdarwis) di desa-desa wisata potensial.",
      "Pengawasan standar kualitas pelayanan, sertifikasi pemandu wisata, dan keamanan wisata.",
    ],
    program: [
      "Pengembangan Desa Wisata Terpadu (Braja Harjosari, Wana, Labuhan Ratu VII).",
      "Penyelenggaraan Calendar of Events (Festival Way Kambas, Festival Pantai Kerang Mas).",
      "Pelatihan Sertifikasi Kompetensi Pramuwisata & Standardisasi Homestay.",
    ],
  },
  {
    id: "olahraga",
    title: "Olahraga",
    icon: <Award size={28} />,
    color: "#f59e0b",
    tagline: "Pembinaan Atlet Prestasi & Peningkatan Kebugaran Masyarakat",
    tugas: [
      "Pembinaan cabang olahraga prestasi di bawah naungan KONI Lampung Timur.",
      "Penyelenggaraan Pekan Olahraga Kabupaten (PORKAB) dan fasilitasi keikutsertaan PORPROV.",
      "Pembibitan atlet usia dini berkolaborasi dengan lembaga pendidikan/sekolah olahraga.",
      "Pengembangan olahraga rekreasi dan olahraga tradisional untuk kebugaran masyarakat luas.",
      "Pengelolaan, pemeliharaan, serta pembangunan sarana infrastruktur olahraga daerah.",
    ],
    program: [
      "Pekan Olahraga Pelajar Kabupaten Lampung Timur.",
      "Pembangunan & Rehabilitasi Lapangan Olahraga Desa Wisata.",
      "Pembinaan Atlet Unggulan Daerah Menuju Event Nasional.",
    ],
  },
  {
    id: "pemuda",
    title: "Pemuda",
    icon: <Users size={28} />,
    color: "#8b5cf6",
    tagline: "Kepemimpinan, Kewirausahaan, & Kemandirian Pemuda",
    tugas: [
      "Pemberdayaan organisasi kepemudaan (KNPI, Karang Taruna, Purna Paskibraka, Pramuka).",
      "Pelatihan kepemimpinan tingkat dasar, madya, dan utama bagi aktivis pemuda.",
      "Pengembangan wirausaha muda pemula (WMP) melalui bantuan modal dan pendampingan.",
      "Pemberian penghargaan bagi pemuda pelopor di bidang pendidikan, teknologi, dan sosial.",
      "Pencegahan bahaya kenakalan remaja, edukasi narkoba, serta pembinaan kreativitas pemuda.",
    ],
    program: [
      "Pendidikan Kilat Kepemimpinan Pemuda Kader Daerah.",
      "Pemilihan Pemuda Pelopor Berprestasi Lampung Timur.",
      "Karang Taruna Wirausaha Mandiri di Tingkat Kecamatan.",
    ],
  },
];

const stats = [
  { value: "5",   label: "Bidang Kerja",      color: "#059669", bg: "#ecfdf5", icon: <Briefcase size={22}/> },
  { value: "24",  label: "Kecamatan",          color: "#3b82f6", bg: "#eff6ff", icon: <MapPin size={22}/> },
  { value: "264", label: "Desa & Kelurahan",   color: "#8b5cf6", bg: "#f5f3ff", icon: <Users size={22}/> },
  { value: "71+", label: "Destinasi Wisata",   color: "#f59e0b", bg: "#fffbeb", icon: <Compass size={22}/> },
];

const renstraItems = [
  {
    num: "01",
    color: "#10b981",
    title: "Pengembangan Destinasi Wisata",
    items: ["Pemberdayaan Kelompok Sadar Wisata (Pokdarwis)", "Pengembangan desa wisata tematik berbasis budaya lokal", "Peningkatan aksesibilitas dan amenitas wisata unggulan"],
  },
  {
    num: "02",
    color: "#8b5cf6",
    title: "Pembinaan Kepemudaan",
    items: ["Pendidikan dan pelatihan kepemimpinan Paskibraka", "Pemberdayaan organisasi pemuda tingkat kecamatan", "Program wirausaha muda dan inovasi daerah"],
  },
  {
    num: "03",
    color: "#f59e0b",
    title: "Peningkatan Prestasi Olahraga",
    items: ["Pembinaan dan pelatihan atlet cabang olahraga unggulan", "Penyelenggaraan kompetisi olahraga tingkat kabupaten", "Rehabilitasi dan pembangunan sarana olahraga desa"],
  },
  {
    num: "04",
    color: "#ec4899",
    title: "Ekonomi Kreatif & UMKM",
    items: ["Fasilitasi pameran produk unggulan daerah", "Pelatihan digital marketing pelaku usaha kreatif", "Kemitraan sertifikasi halal dan standarisasi produk lokal"],
  },
];

export default function ProfilDinas() {
  const [activeBidang, setActiveBidang] = useState(0);
  const pejabatRef = useRef<HTMLDivElement>(null);
  const scrollPejabat = (dir: number) => {
    pejabatRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div style={{ paddingBottom: "6rem" }}>

      {/* ── HERO ── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5, 46, 35, 0.95) 0%, rgba(6, 78, 59, 0.75) 55%, rgba(6, 78, 59, 0.2) 100%), url('/hero%20profile.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          borderRadius: "24px",
          overflow: "hidden",
        }}>
          {/* dot grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4.5rem", paddingBottom: "4.5rem" }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              style={{
                fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.25,
                maxWidth: "580px",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 12px rgba(0,0,0,0.25)",
                margin: "0 0 1.25rem 0",
              }}
            >
              Dinas Pariwisata,<br />
              Kepemudaan &amp; Olahraga
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.3 }}
              style={{
                fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
                color: "#d1fae5",
                maxWidth: "700px",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Sebagai unsur pelaksana otonomi daerah Kabupaten Lampung Timur, DISPARPORA berkomitmen memajukan pariwisata, ekonomi kreatif, kepemudaan, dan olahraga — demi mewujudkan kesejahteraan masyarakat dan daya saing daerah yang berkelanjutan.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--border)", marginBottom: "5rem", padding: "2.5rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              style={{
                textAlign: "center",
                padding: "1.75rem 1.25rem",
                backgroundColor: "white",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.25rem" }}>
                {s.icon}
              </div>
              <p style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── VISI & MISI ── */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Visi &amp; Misi</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800 }}>Arah &amp; Cita-cita Pembangunan Daerah</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Visi */}
          <motion.div
            {...fadeUp(0.1)}
            style={{
              background: "linear-gradient(145deg, #052e1c 0%, #064e3b 50%, #065f46 100%)",
              borderRadius: "28px",
              padding: "2.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", bottom: "-50px", left: "20px", fontSize: "12rem", fontWeight: 900, color: "rgba(255,255,255,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>&ldquo;</div>

            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.12)", marginBottom: "1.5rem" }}>
              <Star size={20} style={{ color: "#6ee7b7" }} />
            </div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6ee7b7", marginBottom: "1rem" }}>Visi Kabupaten Lampung Timur</p>
            <p style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 800, color: "white", lineHeight: 1.4, margin: 0, position: "relative", zIndex: 1 }}>
              &ldquo;Rakyat Lampung Timur Berjaya&rdquo;
            </p>
          </motion.div>

          {/* Misi */}
          <motion.div
            {...fadeUp(0.2)}
            style={{ borderRadius: "28px", border: "1.5px solid var(--border)", padding: "2.5rem", backgroundColor: "white", boxShadow: "var(--card-shadow)" }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "#ecfdf5", marginBottom: "1.5rem" }}>
              <Target size={20} style={{ color: "#059669" }} />
            </div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#059669", marginBottom: "1.5rem" }}>Misi Strategis Dinas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {[
                "Meningkatkan daya saing ekonomi daerah berbasis pariwisata, industri kreatif, dan potensi sumber daya lokal.",
                "Membangun sumber daya manusia yang unggul, berkarakter, berdaya saing, dan berjiwa kewirausahaan.",
                "Mendorong pertumbuhan koperasi, UMKM, serta usaha sektor informal masyarakat secara berkelanjutan.",
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", fontSize: "0.8rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65 }}>{m}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TUPOKSI ── */}
      <section id="tupoksi" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)", padding: "5rem 0", marginBottom: "5rem", scrollMarginTop: "90px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem", alignItems: "start" }}>
            {/* Left: intro */}
            <motion.div {...fadeUp()}>
              <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "1rem" }}>Tupoksi &amp; Dasar Hukum</span>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: "1rem" }}>Kedudukan, Tugas Pokok &amp; Fungsi</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Ditetapkan berdasarkan <strong>Peraturan Bupati Lampung Timur Nomor 71 Tahun 2021</strong> tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi, serta Tata Kerja Dinas Pariwisata, Kepemudaan dan Olahraga Kabupaten Lampung Timur.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "white", border: "1px solid #d1fae5", borderRadius: "14px", padding: "1rem 1.25rem" }}>
                <Scale size={20} style={{ color: "#059669", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Perbup Nomor 71 Tahun 2021 — Lampung Timur</p>
              </div>
            </motion.div>

            {/* Right: 4 items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: <MapPin size={20} />, color: "#059669", bg: "#ecfdf5", title: "Kedudukan", body: "Unsur pelaksana otonomi daerah di bawah Bupati, bertanggung jawab atas urusan pemerintahan di bidang pariwisata, kepemudaan, dan keolahragaan." },
                { icon: <Briefcase size={20} />, color: "#3b82f6", bg: "#eff6ff", title: "Tugas Pokok", body: "Melaksanakan urusan pemerintahan daerah berdasarkan asas otonomi dan tugas pembantuan di bidang pariwisata, ekonomi kreatif, kepemudaan, dan keolahragaan." },
                { icon: <Zap size={20} />, color: "#f59e0b", bg: "#fffbeb", title: "Fungsi", body: "Perumusan kebijakan teknis, pengkoordinasian, pembinaan, pelaksanaan tugas, serta evaluasi dan pelaporan kinerja dinas." },
                { icon: <ShieldCheck size={20} />, color: "#8b5cf6", bg: "#f5f3ff", title: "Pertanggungjawaban", body: "Kepala Dinas bertanggung jawab kepada Bupati melalui Sekretaris Daerah sesuai dengan ketentuan peraturan perundang-undangan yang berlaku." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(0.05 + i * 0.07)}
                  style={{ display: "flex", gap: "1rem", alignItems: "flex-start", backgroundColor: "white", borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
                >
                  <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "12px", backgroundColor: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.3rem" }}>{item.title}</p>
                    <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUKTUR ORGANISASI / SUSUNAN PEJABAT ── */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <motion.div {...fadeUp()} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Struktur Organisasi</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, margin: 0 }}>Susunan Pejabat DISPARPORA</h2>
          </div>
          <Link href="#bidang" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: "0.82rem", padding: "0.6rem 1.1rem", borderRadius: "999px", textDecoration: "none", border: "1px solid #e2e8f0" }}>
            Tupoksi Bidang
          </Link>
        </motion.div>

        {/* Featured — Kepala Dinas */}
        <motion.div {...fadeUp(0.05)} whileHover={{ y: -4 }} className="pejabat-card" style={{
          backgroundColor: "white",
          borderRadius: "22px",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.75rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ecfdf5", border: "3px solid #a7f3d0", overflow: "hidden", flexShrink: 0 }}>
            <img src={kepalaDinas.photo} alt={kepalaDinas.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
          </div>
          <div style={{ flex: "1 1 240px" }}>
            <h3 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>{kepalaDinas.name}</h3>
            <p style={{ color: "#059669", fontWeight: 700, fontSize: "1rem", margin: "0.35rem 0 0.9rem" }}>{kepalaDinas.role}</p>
            <span style={{ display: "inline-block", fontFamily: "monospace", fontSize: "0.82rem", letterSpacing: "0.04em", color: "#475569", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", padding: "0.4rem 0.9rem", borderRadius: "8px" }}>{kepalaDinas.unit}</span>
          </div>
        </motion.div>

        {/* Carousel pejabat */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>Pejabat Struktural</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => scrollPejabat(-1)} aria-label="Sebelumnya" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollPejabat(1)} aria-label="Berikutnya" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={pejabatRef} className="pejabat-carousel" style={{ display: "flex", gap: "1.25rem", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0.6rem 0.4rem 1.1rem" }}>
          {pejabatList.map((p, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.08 + i * 0.06)}
              whileHover={{ y: -4 }}
              className="pejabat-card"
              style={{
                flex: "0 0 240px",
                scrollSnapAlign: "start",
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "1.5rem",
              }}
            >
              <div style={{ width: "74px", height: "74px", borderRadius: "50%", backgroundColor: "var(--primary-light)", border: "2px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>{p.name.replace(/^Bidang\s/, "").charAt(0)}</span>
              </div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>{p.name}</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0.2rem 0 0.7rem" }}>{p.sub}</p>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>{p.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BIDANG DETAIL ── */}
      <section id="bidang" style={{ backgroundColor: "#f8fafc", padding: "5rem 0", scrollMarginTop: "90px" }}>
        <div className="container">
          <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Tupoksi Bidang</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800 }}>Tugas Pokok &amp; Fungsi Tiap Bidang</h2>
            <p style={{ maxWidth: "560px", margin: "0.75rem auto 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Klik bidang di bawah untuk melihat uraian tupoksi dan program kerja prioritasnya.
            </p>
          </motion.div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
            {bidangDetails.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBidang(i)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "999px",
                  border: `2px solid ${activeBidang === i ? b.color : "#e2e8f0"}`,
                  backgroundColor: activeBidang === i ? b.color : "white",
                  color: activeBidang === i ? "white" : "#64748b",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  fontFamily: "var(--font-main)",
                }}
              >
                {b.title}
              </button>
            ))}
          </div>

          {/* Active content */}
          {bidangDetails.map((bidang, i) => (
            <div key={bidang.id} id={bidang.id} style={{ display: activeBidang === i ? "block" : "none", scrollMarginTop: "100px" }}>

              {/* Header card */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                borderTop: `4px solid ${bidang.color}`,
                boxShadow: "var(--card-shadow)",
                padding: "1.75rem 2rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
              }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: `${bidang.color}14`, color: bidang.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {bidang.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>Bidang</p>
                  <h3 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: 900, margin: 0 }}>{bidang.title}</h3>
                  <p style={{ color: bidang.color, fontWeight: 600, fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{bidang.tagline}</p>
                </div>
              </div>

              {/* 2-col content */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>

                {/* Tupoksi - clean list */}
                <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: `${bidang.color}14`, color: bidang.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={14} />
                    </div>
                    <p style={{ fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Uraian Tupoksi</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {bidang.tugas.map((t, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem", padding: "0.85rem 0", borderBottom: idx < bidang.tugas.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <span style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "8px", backgroundColor: `${bidang.color}14`, color: bidang.color, fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {idx + 1}
                        </span>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program Prioritas */}
                <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: `${bidang.color}14`, color: bidang.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Star size={14} />
                    </div>
                    <p style={{ fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Program Prioritas</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {bidang.program.map((p, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.1rem 1.25rem", borderRadius: "14px", border: "1px solid var(--border)", backgroundColor: "#fafafa" }}>
                        <div style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "10px", backgroundColor: bidang.color, color: "white", fontSize: "0.78rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RENSTRA ── */}
      <section className="container" style={{ padding: "5rem 0 0" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Rencana Strategis</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800 }}>Program Unggulan Renstra Dinas</h2>
          <p style={{ maxWidth: "520px", margin: "0.75rem auto 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Arah kebijakan dan program prioritas DISPARPORA Lampung Timur dalam periode pembangunan daerah.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {renstraItems.map((r, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", position: "relative", overflow: "hidden" }}
            >
              <span style={{ position: "absolute", top: "1rem", right: "1.25rem", fontSize: "3.5rem", fontWeight: 900, color: `${r.color}12`, lineHeight: 1, userSelect: "none" }}>{r.num}</span>
              <div style={{ width: "4px", height: "32px", backgroundColor: r.color, borderRadius: "2px", marginBottom: "1.25rem" }} />
              <h4 style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "1rem" }}>{r.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {r.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={13} style={{ color: r.color, flexShrink: 0, marginTop: "3px" }} />
                    <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
