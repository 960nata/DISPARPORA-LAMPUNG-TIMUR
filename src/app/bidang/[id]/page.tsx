"use client";

import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase, Sparkles, Compass, Award, Users,
  CheckCircle2, Target, Zap, ArrowLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import AthleteAchievements from "@/components/olahraga/AthleteAchievements";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

const BIDANG_DATA: Record<string, any> = {
  sekretariat: {
    title: "Sekretariat",
    icon: Briefcase,
    tagline: "Pusat Pelayanan Administrasi & Operasional Dinas",
    heroImg: "/Gallery/hero1.avif",
    label: "Administrasi & Tata Kelola",
    desc: "Sekretariat DISPARPORA Lampung Timur berperan sebagai tulang punggung operasional dinas, memastikan seluruh proses administrasi, keuangan, dan kepegawaian berjalan tertib, transparan, dan akuntabel demi mendukung kinerja seluruh bidang teknis.",
    tugas: [
      "Pengelolaan administrasi surat-menyurat, kearsipan, dan dokumentasi kedinasan secara tertib dan terdigitalisasi.",
      "Penyusunan rencana kerja operasional tahunan, evaluasi kinerja berkala, dan pelaporan realisasi program.",
      "Pengelolaan keuangan dinas meliputi penyusunan anggaran, pencairan, pertanggungjawaban, dan audit internal.",
      "Pembinaan kepegawaian: disiplin kerja, mutasi, promosi jabatan, dan pengembangan kompetensi ASN.",
      "Koordinasi hubungan masyarakat (humas), protokoler, dan dokumentasi kegiatan resmi kedinasan.",
      "Pengelolaan aset dan inventaris dinas serta pemeliharaan sarana dan prasarana kantor.",
    ],
    program: [
      { title: "Digitalisasi Arsip Dinas", desc: "Transformasi sistem pengarsipan konvensional ke sistem digital berbasis cloud untuk efisiensi dan keamanan data." },
      { title: "Renstra Dinas 2025–2030", desc: "Penyusunan Rencana Strategis jangka panjang yang selaras dengan RPJMD Kabupaten Lampung Timur." },
      { title: "Peningkatan Kapasitas ASN", desc: "Program bimtek, diklat fungsional, dan pelatihan kepemimpinan bagi aparatur dinas secara berkelanjutan." },
    ],
    stats: [
      { value: "100%", label: "Realisasi Anggaran", sub: "Target efisiensi belanja dinas" },
      { value: "0 Temuan", label: "Audit Internal", sub: "Laporan keuangan tertib" },
      { value: "45+", label: "ASN Terbina", sub: "Staf aktif seluruh bidang" },
    ],
  },
  "ekonomi-kreatif": {
    title: "Ekonomi Kreatif",
    icon: Sparkles,
    tagline: "Inovasi & Pemberdayaan Industri Kreatif Lokal",
    heroImg: "/Gallery/image.avif",
    label: "Industri Kreatif & UMKM",
    desc: "Bidang Ekonomi Kreatif mendorong tumbuhnya ekosistem industri kreatif yang berdaya saing di Lampung Timur — dari kain tapis, kerajinan tangan, kuliner khas, hingga konten digital — melalui pembinaan, fasilitasi, dan pemasaran yang terstruktur.",
    tugas: [
      "Identifikasi, pendataan, dan pemetaan potensi pelaku ekonomi kreatif di seluruh kecamatan Lampung Timur.",
      "Pembinaan dan fasilitasi sertifikasi usaha industri kriya, fashion lokal, kuliner, seni pertunjukan, dan konten digital.",
      "Penyelenggaraan pameran dan gelar produk ekonomi kreatif di tingkat kabupaten, provinsi, dan nasional.",
      "Pelatihan kewirausahaan, manajemen produk, pemasaran digital (digital marketing), dan perlindungan HAKI.",
      "Pembangunan inkubator bisnis kreatif dan kemitraan strategis dengan platform e-commerce nasional.",
      "Fasilitasi akses permodalan UMKM kreatif melalui program KUR, hibah, dan kemitraan swasta.",
    ],
    program: [
      { title: "Festival Ekraf & Gelar Produk", desc: "Pameran tahunan produk unggulan UMKM kreatif Lampung Timur yang menghadirkan pembeli dari seluruh Indonesia." },
      { title: "Pelatihan Digital Marketing", desc: "Workshop intensif e-commerce, media sosial, dan foto produk untuk pelaku usaha kriya dan kuliner lokal." },
      { title: "Sertifikasi Halal & BPOM", desc: "Fasilitasi pengurusan sertifikat halal dan izin edar BPOM untuk industri rumahan binaan dinas." },
    ],
    stats: [
      { value: "500+", label: "Pelaku Ekraf", sub: "Terdaftar & terbina aktif" },
      { value: "12 Sub-sektor", label: "Industri Kreatif", sub: "Yang dikembangkan" },
      { value: "Rp 2,4 M", label: "Nilai Transaksi", sub: "Pameran tahunan terakhir" },
    ],
  },
  pariwisata: {
    title: "Pariwisata",
    icon: Compass,
    tagline: "Pengembangan Destinasi & Pemasaran Wisata Unggulan",
    heroImg: "/Gallery/Taman Nasional Way Kambas.avif",
    label: "Destinasi & Promosi Wisata",
    desc: "Bidang Pariwisata memimpin pengembangan dan pemasaran destinasi wisata Lampung Timur yang kaya — dari keajaiban alam liar Way Kambas, pesona bahari pantai pesisir timur, hingga warisan budaya prasejarah yang tak ternilai — menuju destinasi unggulan nasional.",
    tugas: [
      "Penyusunan Rencana Induk Pengembangan Pariwisata Daerah (RIPPDA) Kabupaten Lampung Timur.",
      "Pembangunan sarana dan prasarana penunjang pariwisata: amenitas, aksesibilitas jalan wisata, dan rambu wisata.",
      "Promosi destinasi wisata unggulan melalui media digital, cetak, dan keikutsertaan dalam expo wisata nasional.",
      "Pembinaan Kelompok Sadar Wisata (Pokdarwis) di desa-desa wisata potensial seluruh kecamatan.",
      "Pengawasan standar kualitas pelayanan, sertifikasi pemandu wisata, dan keamanan destinasi.",
      "Pengembangan paket wisata terpadu (culture, eco, adventure) untuk meningkatkan lama tinggal wisatawan.",
    ],
    program: [
      { title: "Desa Wisata Terpadu", desc: "Pengembangan Braja Harjosari, Desa Wana, dan Labuhan Ratu VII menjadi destinasi desa wisata berkelas nasional." },
      { title: "Calendar of Events", desc: "Festival Way Kambas, Festival Pantai Kerang Mas, dan Ritual Melasti sebagai kalender event wisata tahunan." },
      { title: "Sertifikasi Pramuwisata", desc: "Pelatihan dan sertifikasi kompetensi pemandu wisata serta standardisasi homestay desa wisata." },
    ],
    stats: [
      { value: "71+", label: "Destinasi Wisata", sub: "Terdaftar & aktif beroperasi" },
      { value: "350K+", label: "Wisatawan/Tahun", sub: "Kunjungan wisatawan 2025" },
      { value: "17", label: "Kecamatan", sub: "Memiliki potensi wisata" },
    ],
  },
  olahraga: {
    title: "Keolahragaan",
    icon: Award,
    tagline: "Pembinaan Atlet Prestasi & Peningkatan Kebugaran Masyarakat",
    heroImg: "/Gallery/3.avif",
    label: "Prestasi & Kebugaran",
    desc: "Bidang Keolahragaan berkomitmen melahirkan atlet-atlet berprestasi dari Lampung Timur melalui pembinaan sistematis berbasis bakat, serta menggerakkan budaya hidup sehat dan aktif di seluruh lapisan masyarakat melalui olahraga rekreasi dan tradisional.",
    tugas: [
      "Pembinaan cabang olahraga prestasi di bawah koordinasi KONI Kabupaten Lampung Timur.",
      "Penyelenggaraan Pekan Olahraga Kabupaten (PORKAB) dan fasilitasi keikutsertaan PORPROV Lampung.",
      "Pembibitan atlet usia dini melalui kerja sama dengan sekolah olahraga dan klub cabor.",
      "Pengembangan olahraga rekreasi masyarakat dan pelestarian olahraga tradisional daerah.",
      "Pengelolaan, pemeliharaan, dan pembangunan sarana infrastruktur olahraga daerah.",
      "Pemantauan dan evaluasi prestasi atlet binaan di event regional dan nasional.",
    ],
    program: [
      { title: "PORKAB Lampung Timur", desc: "Penyelenggaraan Pekan Olahraga Kabupaten sebagai seleksi atlet menuju PORPROV Lampung." },
      { title: "Pembinaan Atlet Unggulan", desc: "Program pemusatan latihan daerah (PELATDA) untuk atlet potensial menuju event nasional dan PON." },
      { title: "Rehab Sarana Olahraga", desc: "Pembangunan dan rehabilitasi lapangan, GOR, dan fasilitas olahraga di tingkat desa dan kecamatan." },
    ],
    stats: [
      { value: "28", label: "Cabang Olahraga", sub: "Di bawah pembinaan KONI" },
      { value: "120+", label: "Atlet Binaan", sub: "Aktif berlatih di PELATDA" },
      { value: "15 Emas", label: "PORPROV 2024", sub: "Medali emas Lampung Timur" },
    ],
  },
  pemuda: {
    title: "Kepemudaan",
    icon: Users,
    tagline: "Kepemimpinan, Kewirausahaan, & Kemandirian Pemuda",
    heroImg: "/Gallery/4.avif",
    label: "Pemberdayaan Pemuda",
    desc: "Bidang Kepemudaan hadir sebagai katalis tumbuhnya generasi muda Lampung Timur yang berkarakter, berdaya saing, dan mandiri — melalui penguatan organisasi pemuda, pelatihan kepemimpinan, pembinaan kewirausahaan, serta pencegahan kenakalan remaja.",
    tugas: [
      "Pemberdayaan dan fasilitasi organisasi kepemudaan: KNPI, Karang Taruna, Purna Paskibraka Indonesia, dan Pramuka.",
      "Penyelenggaraan pelatihan kepemimpinan tingkat dasar, madya, dan utama bagi kader pemuda daerah.",
      "Pengembangan wirausaha muda pemula (WMP) melalui pendampingan, akses modal, dan mentoring bisnis.",
      "Pemberian penghargaan Pemuda Pelopor di bidang pendidikan, teknologi, seni budaya, dan pengabdian masyarakat.",
      "Program pencegahan kenakalan remaja, penyalahgunaan narkoba, dan edukasi bahaya pergaulan bebas.",
      "Fasilitasi pertukaran pemuda antar daerah dan program kepemudaan berskala nasional.",
    ],
    program: [
      { title: "Pendidikan Kepemimpinan Pemuda", desc: "Diklat kepemimpinan berjenjang bagi kader pemuda potensial dari seluruh kecamatan Lampung Timur." },
      { title: "Pemuda Pelopor Berprestasi", desc: "Seleksi dan pemberian penghargaan bagi pemuda inovatif dan berprestasi tingkat kabupaten hingga nasional." },
      { title: "Karang Taruna Wirausaha", desc: "Pemberdayaan Karang Taruna sebagai inkubator wirausaha muda mandiri di tingkat kecamatan dan desa." },
    ],
    stats: [
      { value: "264", label: "Karang Taruna", sub: "Di seluruh desa & kelurahan" },
      { value: "2.000+", label: "Pemuda Terbina", sub: "Melalui berbagai program" },
      { value: "40+", label: "Wirausaha Muda", sub: "Binaan aktif tahun 2025" },
    ],
  },
};

export default function BidangDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const data = BIDANG_DATA[id];

  if (!data) return notFound();

  const Icon = data.icon;

  return (
    <div style={{ paddingBottom: "6rem" }}>

      {/* ── HERO ── */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3.5rem" }}>
        <div style={{
          position: "relative",
          backgroundImage: `linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.78) 55%, rgba(6,78,59,0.18) 100%), url('${data.heroImg}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          minHeight: "380px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            {/* Breadcrumb */}
            <motion.div {...fadeUp(0)} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <Link href="/bidang" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>Bidang Dinas</Link>
              <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
              <span style={{ color: "#BEF26A", fontSize: "0.78rem", fontWeight: 700 }}>Bidang {data.title}</span>
            </motion.div>

            <motion.div {...fadeUp(0.05)}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(190,242,106,0.15)", border: "1px solid rgba(190,242,106,0.3)", borderRadius: "99px", padding: "5px 14px", marginBottom: "1rem" }}>
                <Icon size={13} style={{ color: "#BEF26A" }} />
                <span style={{ color: "#BEF26A", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{data.label}</span>
              </div>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, color: "white", lineHeight: 1.15, maxWidth: "620px", letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Bidang {data.title}
            </motion.h1>
            <motion.p {...fadeUp(0.2)} style={{ fontSize: "clamp(0.88rem, 1.5vw, 1rem)", color: "#d1fae5", maxWidth: "560px", lineHeight: 1.75, margin: 0 }}>
              {data.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>

        {/* Deskripsi */}
        <motion.div {...fadeUp(0)} className="bidang-detail-dark-box" style={{
          background: "linear-gradient(120deg, #0C3B26, #0F5132)",
          borderRadius: "20px", padding: "2rem 2.5rem", marginBottom: "2.5rem",
          display: "flex", gap: "1.5rem", alignItems: "flex-start",
        }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(190,242,106,0.2)", border: "1px solid rgba(190,242,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={24} style={{ color: "#BEF26A" }} />
          </div>
          <div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.6rem" }}>Tentang Bidang {data.title}</h2>
            <p style={{ color: "#d1fae5", fontSize: "0.92rem", lineHeight: 1.8, margin: 0 }}>{data.desc}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.05)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {data.stats.map((s: any, i: number) => (
            <div key={i} style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0E9F4F", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", marginTop: "0.4rem" }}>{s.label}</div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "0.2rem" }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Athlete Achievements Table - Keolahragaan only */}
        {id === "olahraga" && <AthleteAchievements />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2.5rem" }} className="bidang-detail-grid">

          {/* Tugas & Fungsi */}
          <motion.div {...fadeUp(0.1)} style={{ background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "2rem", boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0C3B26, #0F5132)", display: "flex", alignItems: "center", justifyContent: "center", color: "#BEF26A", flexShrink: 0 }}>
                <Target size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Tugas Pokok & Fungsi</h3>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {data.tugas.map((t: string, i: number) => (
                <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#0E9F4F", color: "#fff", fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
                  <span style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.65 }}>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Program Kerja */}
          <motion.div {...fadeUp(0.15)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0C3B26, #0F5132)", display: "flex", alignItems: "center", justifyContent: "center", color: "#BEF26A", flexShrink: 0 }}>
                <Zap size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Program Kerja Prioritas</h3>
            </div>
            {data.program.map((p: any, i: number) => (
              <div key={i} style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem", boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)", borderLeft: "4px solid #0E9F4F" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <CheckCircle2 size={15} style={{ color: "#0E9F4F", flexShrink: 0 }} />
                  <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>{p.title}</h4>
                </div>
                <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(0.2)} className="bidang-detail-cta" style={{ marginTop: "2.5rem", borderRadius: "20px", background: "linear-gradient(120deg, #0C3B26, #0F5132)", padding: "2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ color: "white", margin: "0 0 0.4rem", fontWeight: 800, fontSize: "1.05rem" }}>Ingin Tahu Lebih Lanjut?</h3>
            <p style={{ color: "#d1fae5", margin: 0, fontSize: "0.88rem" }}>Lihat profil lengkap dinas atau hubungi kami langsung.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/bidang" style={{ padding: "0.65rem 1.4rem", borderRadius: "10px", background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(255,255,255,0.25)" }}>
              <ArrowLeft size={15} /> Semua Bidang
            </Link>
            <Link href="/kontak" style={{ padding: "0.65rem 1.4rem", borderRadius: "10px", background: "#BEF26A", color: "#0C3B26", fontWeight: 800, fontSize: "0.88rem", textDecoration: "none" }}>
              Hubungi Kami
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .bidang-detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .bidang-detail-dark-box {
            padding: 1.25rem !important;
            gap: 1rem !important;
          }
          .bidang-detail-cta {
            padding: 1.5rem !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
