"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Users,
  ShieldCheck,
  Award,
  Scale,
  MapPin,
  Briefcase,
  Sparkles,
  Zap,
  Quote,
  Check,
  Store,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, delay },
});

const GREEN = "#0E9F4F";
const LIME = "#BEF26A";
const FOREST_GRADIENT = "linear-gradient(120deg, #0C3B26, #0F5132)";

const kepalaDinas = {
  name: "Marsan, S.Pd., Ing., M.Pd.",
  role: "Kepala Dinas",
  unit: "DISPARPORA Lampung Timur",
  photo: "/leaders/kadis.avif",
};

const pejabatList = [
  { letter: "S", name: "Sekretariat", role: "Sekretaris Dinas", sub: "Administrasi & Operasional", bidangId: "sekretariat" },
  { letter: "P", name: "Bidang Pariwisata", role: "Kepala Bidang", sub: "Pengembangan Destinasi", bidangId: "pariwisata" },
  { letter: "E", name: "Bidang Ekonomi Kreatif", role: "Kepala Bidang", sub: "Industri & Kriya Kreatif", bidangId: "ekonomi-kreatif" },
  { letter: "K", name: "Bidang Kepemudaan", role: "Kepala Bidang", sub: "Pemberdayaan Pemuda", bidangId: "pemuda" },
  { letter: "K", name: "Bidang Keolahragaan", role: "Kepala Bidang", sub: "Pembinaan Prestasi", bidangId: "olahraga" },
];

const bidangDetails = [
  {
    id: "sekretariat",
    title: "Sekretariat",
    icon: <Briefcase size={22} />,
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
    icon: <Sparkles size={22} />,
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
    icon: <Compass size={22} />,
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
    icon: <Award size={22} />,
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
    icon: <Users size={22} />,
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
  { value: "5",   label: "Bidang Kerja",      sub: "Unit kerja struktural dinas",   icon: <Briefcase size={22}/> },
  { value: "24",  label: "Kecamatan",          sub: "Wilayah administratif",         icon: <MapPin size={22}/> },
  { value: "264", label: "Desa & Kelurahan",   sub: "Tersebar di seluruh wilayah",   icon: <Users size={22}/> },
  { value: "71+", label: "Destinasi Wisata",   sub: "Daya tarik wisata unggulan",    icon: <Compass size={22}/> },
];

const renstraItems = [
  {
    icon: <MapPin size={24} />,
    title: "Pengembangan Destinasi Wisata",
    items: ["Pemberdayaan Kelompok Sadar Wisata (Pokdarwis)", "Pengembangan desa wisata tematik berbasis budaya lokal", "Peningkatan aksesibilitas dan amenitas wisata unggulan"],
  },
  {
    icon: <Users size={24} />,
    title: "Pembinaan Kepemudaan",
    items: ["Pendidikan dan pelatihan kepemimpinan Paskibraka", "Pemberdayaan organisasi pemuda tingkat kecamatan", "Program wirausaha muda dan inovasi daerah"],
  },
  {
    icon: <Award size={24} />,
    title: "Peningkatan Prestasi Olahraga",
    items: ["Pembinaan dan pelatihan atlet cabang olahraga unggulan", "Penyelenggaraan kompetisi olahraga tingkat kabupaten", "Rehabilitasi dan pembangunan sarana olahraga desa"],
  },
  {
    icon: <Store size={24} />,
    title: "Ekonomi Kreatif & UMKM",
    items: ["Fasilitasi pameran produk unggulan daerah", "Pelatihan digital marketing pelaku usaha kreatif", "Kemitraan sertifikasi halal dan standarisasi produk lokal"],
    highlight: true,
  },
];

export default function ProfilDinas() {
  const [activeBidang, setActiveBidang] = useState(0);

  const gotoBidang = (bidangId: string) => {
    const idx = bidangDetails.findIndex(b => b.id === bidangId);
    if (idx >= 0) setActiveBidang(idx);
    document.getElementById("bidang")?.scrollIntoView({ behavior: "smooth" });
  };

  const active = bidangDetails[activeBidang];

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

      {/* ── STATS STRIP (di bawah hero, tidak menempel) ── */}
      <section className="container" style={{ marginTop: "3rem", marginBottom: "5rem" }}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {stats.map((s, i) => {
            const highlight = i === stats.length - 1;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "1.5rem",
                  backgroundColor: highlight ? GREEN : "white",
                  borderRadius: "20px",
                  border: highlight ? "none" : "1px solid rgba(16,40,28,0.08)",
                  boxShadow: "0 20px 40px -28px rgba(12,59,38,0.4)",
                }}
              >
                {highlight && (
                  <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                )}
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: highlight ? "rgba(255,255,255,0.18)" : "rgba(14,159,79,0.1)", color: highlight ? "white" : GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.icon}
                </div>
                <p style={{ marginTop: "0.9rem", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: highlight ? "white" : GREEN, lineHeight: 1 }}>{s.value}</p>
                <p style={{ marginTop: "0.3rem", fontSize: "0.9rem", fontWeight: 700, color: highlight ? "white" : "#11231A" }}>{s.label}</p>
                <p style={{ marginTop: "0.1rem", fontSize: "0.78rem", color: highlight ? "rgba(255,255,255,0.82)" : "#6b7a70" }}>{s.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── VISI & MISI ── */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-block", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Visi &amp; Misi</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800 }}>Arah &amp; Cita-cita Pembangunan Daerah</h2>
        </motion.div>

        {/* Visi — quote panel */}
        <motion.div
          {...fadeUp(0.1)}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "28px",
            background: FOREST_GRADIENT,
            padding: "3.5rem 3rem",
            textAlign: "center",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(190,242,106,0.1) 1.4px, transparent 1.6px)", backgroundSize: "20px 20px" }} />
          <Quote size={40} style={{ position: "relative", color: LIME, opacity: 0.9 }} />
          <p style={{ position: "relative", marginTop: "1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: LIME }}>Visi Kabupaten Lampung Timur</p>
          <p style={{ position: "relative", marginTop: "1rem", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "white", lineHeight: 1.15, margin: "1rem 0 0" }}>
            &ldquo;Rakyat Lampung Timur Berjaya&rdquo;
          </p>
        </motion.div>

        {/* Misi — numbered cards */}
        <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7a70", textAlign: "center" }}>Misi Strategis Dinas</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginTop: "1.25rem" }}>
          {[
            "Meningkatkan daya saing ekonomi daerah berbasis pariwisata, industri kreatif, dan potensi sumber daya lokal.",
            "Membangun sumber daya manusia yang unggul, berkarakter, berdaya saing, dan berjiwa kewirausahaan.",
            "Mendorong pertumbuhan koperasi, UMKM, serta usaha sektor informal masyarakat secara berkelanjutan.",
          ].map((m, i) => {
            const highlight = i === 2;
            return (
              <motion.div
                key={i}
                {...fadeUp(i * 0.09)}
                whileHover={{ y: -6 }}
                style={{
                  backgroundColor: highlight ? LIME : "white",
                  border: highlight ? "none" : "1px solid rgba(16,40,28,0.08)",
                  borderRadius: "22px",
                  padding: "1.875rem",
                  transition: "box-shadow 0.3s",
                }}
              >
                <div style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: highlight ? "rgba(12,59,38,0.3)" : "rgba(14,159,79,0.18)" }}>{String(i + 1).padStart(2, "0")}</div>
                <p style={{ margin: "1rem 0 0", fontSize: "0.94rem", lineHeight: 1.6, color: highlight ? "#0C3B26" : "#3a463e", fontWeight: highlight ? 600 : 500 }}>{m}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── TUPOKSI & DASAR HUKUM ── */}
      <section id="tupoksi" style={{ scrollMarginTop: "90px" }}>
        <div className="container" style={{ marginBottom: "5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.5rem", alignItems: "center" }}>
            {/* Left: intro */}
            <motion.div {...fadeUp()}>
              <span style={{ display: "inline-block", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "1rem" }}>Tupoksi &amp; Dasar Hukum</span>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: "1rem" }}>Kedudukan, Tugas Pokok &amp; Fungsi</h2>
              <p style={{ color: "#46564c", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Ditetapkan berdasarkan <strong>Peraturan Bupati Lampung Timur Nomor 71 Tahun 2021</strong> tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi, serta Tata Kerja Dinas Pariwisata, Kepemudaan dan Olahraga Kabupaten Lampung Timur.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: "white", border: "1px solid rgba(16,40,28,0.08)", borderRadius: "16px", padding: "1rem 1.25rem" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: "rgba(14,159,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Scale size={20} style={{ color: GREEN }} />
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#11231A" }}>Perbup Nomor 71 Tahun 2021</p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7a70" }}>Dasar hukum penyelenggaraan dinas</p>
                </div>
              </div>
            </motion.div>

            {/* Right: 4 items */}
            <div className="tupoksi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {[
                { icon: <MapPin size={20} />, title: "Kedudukan", body: "Unsur pelaksana otonomi daerah di bawah Bupati, bertanggung jawab atas urusan pariwisata, kepemudaan, dan keolahragaan." },
                { icon: <Briefcase size={20} />, title: "Tugas Pokok", body: "Melaksanakan urusan pemerintahan berdasarkan asas otonomi dan tugas pembantuan di bidang pariwisata, ekraf, kepemudaan, dan olahraga." },
                { icon: <Zap size={20} />, title: "Fungsi", body: "Perumusan kebijakan teknis, pengkoordinasian, pembinaan, pelaksanaan tugas, serta evaluasi dan pelaporan kinerja dinas." },
                { icon: <ShieldCheck size={20} />, title: "Pertanggungjawaban", body: "Kepala Dinas bertanggung jawab kepada Bupati melalui Sekretaris Daerah sesuai ketentuan peraturan perundang-undangan." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(0.05 + i * 0.07)}
                  whileHover={{ y: -5 }}
                  style={{ backgroundColor: "white", border: "1px solid rgba(16,40,28,0.08)", borderRadius: "20px", padding: "1.5rem" }}
                >
                  <span style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  <p style={{ marginTop: "0.875rem", fontWeight: 800, fontSize: "0.94rem" }}>{item.title}</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", lineHeight: 1.6, color: "#5a6960" }}>{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUKTUR ORGANISASI ── */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-block", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Struktur Organisasi</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, margin: 0 }}>Susunan Pejabat DISPARPORA</h2>
        </motion.div>

        {/* Kepala Dinas */}
        <motion.div {...fadeUp(0.05)} style={{
          maxWidth: "560px",
          margin: "0 auto 2.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.375rem",
          background: FOREST_GRADIENT,
          borderRadius: "24px",
          padding: "1.375rem",
          boxShadow: "0 26px 52px -28px rgba(12,59,38,0.55)",
        }}>
          <div style={{ width: "104px", height: "104px", flexShrink: 0, borderRadius: "18px", overflow: "hidden", border: "3px solid rgba(255,255,255,0.18)" }}>
            <img src={kepalaDinas.photo} alt={kepalaDinas.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
          </div>
          <div>
            <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "20px", backgroundColor: LIME, color: "#0C3B26", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.04em" }}>KEPALA DINAS</span>
            <p style={{ margin: "0.6rem 0 0", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.01em", color: "white" }}>{kepalaDinas.name}</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.72)" }}>{kepalaDinas.unit}</p>
          </div>
        </motion.div>

        {/* Pejabat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
          {pejabatList.map((p, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.06 + i * 0.06)}
              whileHover={{ y: -6 }}
              onClick={() => gotoBidang(p.bidangId)}
              role="button"
              tabIndex={0}
              style={{
                cursor: "pointer",
                backgroundColor: "white",
                border: "1px solid rgba(16,40,28,0.08)",
                borderRadius: "20px",
                padding: "1.375rem",
                textAlign: "center",
              }}
            >
              <div style={{ width: "54px", height: "54px", margin: "0 auto", borderRadius: "16px", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", fontWeight: 800 }}>
                {p.letter}
              </div>
              <p style={{ marginTop: "0.875rem", fontSize: "0.9rem", fontWeight: 800, color: "#11231A" }}>{p.name}</p>
              <p style={{ marginTop: "0.2rem", fontSize: "0.75rem", color: "#6b7a70", lineHeight: 1.4 }}>{p.sub}</p>
              <p style={{ marginTop: "0.625rem", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{p.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TUPOKSI BIDANG (INTERACTIVE) ── */}
      <section id="bidang" style={{ scrollMarginTop: "90px" }}>
        <div className="container" style={{ marginBottom: "5rem" }}>
          <motion.div {...fadeUp()} style={{ textAlign: "center" }}>
            <span style={{ display: "inline-block", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Tupoksi Bidang</span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, margin: 0 }}>Tugas Pokok &amp; Fungsi Tiap Bidang</h2>
            <p style={{ maxWidth: "560px", margin: "0.75rem auto 0", color: "#46564c", fontSize: "0.9rem" }}>
              Klik bidang di bawah untuk melihat uraian tupoksi dan program kerja prioritasnya.
            </p>
          </motion.div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.875rem", marginBottom: "1.5rem" }}>
            {bidangDetails.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBidang(i)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "999px",
                  border: activeBidang === i ? "none" : "1px solid rgba(16,40,28,0.12)",
                  backgroundColor: activeBidang === i ? GREEN : "white",
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
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "1.25rem", alignItems: "start" }} className="bidang-2col">
            <div style={{ backgroundColor: "white", border: "1px solid rgba(16,40,28,0.08)", borderRadius: "24px", padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <span style={{ width: "50px", height: "50px", borderRadius: "14px", backgroundColor: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active.icon}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.01em", color: "#11231A" }}>{active.title}</p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7a70" }}>{active.tagline}</p>
                </div>
              </div>

              <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GREEN }}>Uraian Tupoksi</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "0.875rem" }}>
                {active.tugas.map((t, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "8px", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontSize: "0.78rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {idx + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55, color: "#3a463e" }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: FOREST_GRADIENT, borderRadius: "24px", padding: "2rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(190,242,106,0.12)" }} />
              <p style={{ position: "relative", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: LIME, margin: 0 }}>Program Prioritas</p>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "1.125rem" }}>
                {active.program.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", paddingBottom: "0.875rem", borderBottom: idx < active.program.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color: LIME, letterSpacing: "-0.02em" }}>{String(idx + 1).padStart(2, "0")}</span>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RENCANA STRATEGIS ── */}
      <section className="container">
        <motion.div {...fadeUp()} style={{ textAlign: "center" }}>
          <span style={{ display: "inline-block", backgroundColor: "rgba(14,159,79,0.1)", color: GREEN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.9rem", borderRadius: "999px", marginBottom: "0.75rem" }}>Rencana Strategis</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, margin: 0 }}>Program Unggulan Renstra Dinas</h2>
          <p style={{ maxWidth: "600px", margin: "0.75rem auto 0", color: "#46564c", fontSize: "0.9rem" }}>
            Arah kebijakan dan program prioritas DISPARPORA Lampung Timur dalam periode pembangunan daerah.
          </p>
        </motion.div>

        <div className="renstra-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.125rem", marginTop: "2.25rem" }}>
          {renstraItems.map((r, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -6 }}
              style={{
                backgroundColor: r.highlight ? LIME : "white",
                border: r.highlight ? "none" : "1px solid rgba(16,40,28,0.08)",
                borderRadius: "24px",
                padding: "1.875rem",
              }}
            >
              <span style={{
                width: "50px", height: "50px", borderRadius: "14px",
                backgroundColor: r.highlight ? "rgba(12,59,38,0.14)" : "rgba(14,159,79,0.1)",
                color: r.highlight ? "#0C3B26" : GREEN,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {r.icon}
              </span>
              <p style={{ marginTop: "1rem", fontSize: "1.125rem", fontWeight: 800, color: r.highlight ? "#0C3B26" : "#11231A" }}>{r.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" }}>
                {r.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <Check size={16} style={{ color: r.highlight ? "#0C3B26" : GREEN, flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.875rem", lineHeight: 1.5, color: r.highlight ? "#0C3B26" : "#46564c", fontWeight: r.highlight ? 500 : 400 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @media (max-width: 900px) {
          .bidang-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .renstra-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .tupoksi-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
