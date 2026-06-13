"use client";

import { motion } from "framer-motion";
import { Briefcase, Sparkles, Palmtree, Award, Users, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BidangDinas() {
  const bidangDetails = [
    {
      id: "sekretariat",
      title: "Sekretariat",
      icon: <Briefcase size={32} />,
      color: "#3b82f6",
      tagline: "Pusat Pelayanan Administrasi & Operasional Dinas",
      tugas: [
        "Pengelolaan administrasi surat-menyurat dan kearsipan dinas.",
        "Penyusunan rencana kerja operasional, evaluasi, dan pelaporan kinerja tahunan.",
        "Pengelolaan keuangan dinas, anggaran belanja, pertanggungjawaban anggaran, dan audit.",
        "Pembinaan kepegawaian, disiplin kerja, mutasi, promosi, dan pengembangan karir staf.",
        "Koordinasi hubungan masyarakat (humas) dan dokumentasi kegiatan kedinasan."
      ],
      program: [
        "Penyusunan Rencana Strategis (Renstra) Dinas jangka panjang.",
        "Program Digitalisasi Arsip & Persuratan Administrasi Kantor.",
        "Peningkatan Kapasitas SDM Aparatur Pemerintah Daerah."
      ]
    },
    {
      id: "ekonomi-kreatif",
      title: "Ekonomi Kreatif",
      icon: <Sparkles size={32} />,
      color: "#ec4899",
      tagline: "Inovasi & Pemberdayaan Industri Kreatif Lokal",
      tugas: [
        "Identifikasi, pendataan, dan pemetaan potensi pelaku ekonomi kreatif di Lampung Timur.",
        "Pembinaan dan fasilitas sertifikasi usaha industri kriya, fashion, kuliner, dan seni.",
        "Penyelenggaraan pameran produk ekonomi kreatif tingkat kabupaten, provinsi, dan nasional.",
        "Pelatihan kewirausahaan, manajemen produk, pemasaran digital, dan perlindungan hak cipta (HAKI).",
        "Pembangunan inkubator bisnis kreatif dan kemitraan dengan jejaring e-commerce."
      ],
      program: [
        "Festival UMKM Kreatif & Gelar Produk Unggulan Lampung Timur.",
        "Pelatihan Digital Marketing dan E-Commerce untuk Pelaku Kriya & Kuliner.",
        "Sertifikasi Halal & BPOM Terfasilitasi untuk Industri Rumahan."
      ]
    },
    {
      id: "pariwisata",
      title: "Pariwisata",
      icon: <Palmtree size={32} />,
      color: "#10b981",
      tagline: "Pengembangan Destinasi & Pemasaran Wisata Unggulan",
      tugas: [
        "Penyusunan rencana induk pengembangan pariwisata daerah (RIPPDA) Lampung Timur.",
        "Pembangunan sarana prasarana penunjang pariwisata (amenitas, aksesibilitas, rambu wisata).",
        "Promosi destinasi wisata unggulan melalui media cetak, digital, dan keikutsertaan expo.",
        "Pembinaan Kelompok Sadar Wisata (Pokdarwis) di desa-desa wisata potensial.",
        "Pengawasan standar kualitas pelayanan, sertifikasi pemandu wisata, keamanan wisata."
      ],
      program: [
        "Pengembangan Desa Wisata Terpadu (Braja Harjosari, Wana, Labuhan Ratu VII).",
        "Penyelenggaraan Calendar of Events (Festival Way Kambas, Festival Pantai Kerang Mas).",
        "Pelatihan Sertifikasi Kompetensi Pramuwisata & Standardisasi Homestay."
      ]
    },
    {
      id: "olahraga",
      title: "Olahraga",
      icon: <Award size={32} />,
      color: "#f59e0b",
      tagline: "Pembinaan Atlet Prestasi & Peningkatan Kebugaran Masyarakat",
      tugas: [
        "Pembinaan cabang olahraga prestasi di bawah naungan KONI Lampung Timur.",
        "Penyelenggaraan Pekan Olahraga Kabupaten (PORKAB) dan fasilitasi keikutsertaan PORPROV.",
        "Pembibitan atlet usia dini berkolaborasi dengan lembaga pendidikan/sekolah olahraga.",
        "Pengembangan olahraga rekreasi dan olahraga tradisional untuk kebugaran masyarakat luas.",
        "Pengelolaan, pemeliharaan, serta pembangunan sarana infrastruktur olahraga daerah."
      ],
      program: [
        "Pekan Olahraga Pelajar Kabupaten Lampung Timur.",
        "Pembangunan & Rehabilitasi Lapangan Olahraga Desa Wisata.",
        "Pembinaan Atlet Unggulan Daerah Menuju Event Nasional."
      ]
    },
    {
      id: "pemuda",
      title: "Pemuda",
      icon: <Users size={32} />,
      color: "#8b5cf6",
      tagline: "Kepemimpinan, Kewirausahaan, & Kemandirian Pemuda",
      tugas: [
        "Pemberdayaan organisasi kepemudaan (KNPI, Karang Taruna, Purna Paskibraka, Pramuka).",
        "Pelatihan kepemimpinan tingkat dasar, madya, dan utama bagi aktivis pemuda.",
        "Pengembangan wirausaha muda pemula (WMP) melalui bantuan modal simulasi dan pendampingan.",
        "Pemberian penghargaan bagi pemuda pelopor di bidang pendidikan, teknologi, budaya, dan sosial.",
        "Pencegahan bahaya kenakalan remaja, edukasi narkoba, serta pembinaan kreativitas pemuda."
      ],
      program: [
        "Pendidikan Kilat Kepemimpinan Pemuda Kader Daerah.",
        "Pemilihan Pemuda Pelopor Berprestasi Lampung Timur.",
        "Karang Taruna Wirausaha Mandiri di Tingkat Kecamatan."
      ]
    }
  ];

  return (
    <div style={{ padding: "3rem 0" }}>
      {/* Page Header */}
      <section className="container" style={{ textAlign: "center", marginBottom: "4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge badge-success" style={{ marginBottom: "1rem" }}>Struktur Organisasi</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}
        >
          Tugas Pokok & Fungsi Bidang
        </motion.h2>
        <div style={{ width: "80px", height: "4px", backgroundColor: "var(--primary)", margin: "1rem auto 1.5rem auto", borderRadius: "2px" }} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ maxWidth: "650px", margin: "0 auto" }}
        >
          Detail penjelasan tugas pokok, fungsi kerja, dan program prioritas dari masing-masing bidang di lingkungan Dinas Pariwisata, Pemuda, dan Olahraga Lampung Timur.
        </motion.p>
      </section>

      {/* Bidang Content Section */}
      <section className="container" style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
        {bidangDetails.map((bidang, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={bidang.id}
              id={bidang.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="card"
              style={{
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                flexWrap: "wrap",
                gap: "3rem",
                padding: "3rem",
                scrollMarginTop: "100px",
                alignItems: "flex-start"
              }}
            >
              {/* Left Column - Icon & Title block */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{
                  backgroundColor: `${bidang.color}15`,
                  color: bidang.color,
                  width: "80px",
                  height: "80px",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {bidang.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Bidang {bidang.title}</h3>
                  <p style={{ color: bidang.color, fontWeight: 700, fontSize: "0.95rem", marginTop: "0.25rem" }}>{bidang.tagline}</p>
                </div>
                <div style={{
                  backgroundColor: "var(--bg-primary)",
                  borderLeft: `4px solid ${bidang.color}`,
                  padding: "1.25rem",
                  borderRadius: "0 12px 12px 0",
                  marginTop: "1rem"
                }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Program Kerja Prioritas:</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", padding: 0 }}>
                    {bidang.program.map((prog, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        <CheckCircle2 size={14} style={{ color: bidang.color, flexShrink: 0 }} />
                        <span>{prog}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Tasks block */}
              <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
                  Tugas Pokok & Fungsi Utama (Tupoksi)
                </h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {bidang.tugas.map((tugasItem, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <span style={{
                        backgroundColor: bidang.color,
                        color: "white",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "3px"
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{tugasItem}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Admin Panel Promo Card */}
      <section className="container" style={{ marginTop: "5rem" }}>
        <div className="card" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "2.5rem",
          gap: "2rem",
          background: "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: "cover"
        }}>
          <div style={{ maxWidth: "600px" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Akses Sistem Informasi Pendukung Kegiatan</h3>
            <p style={{ marginTop: "0.5rem" }}>
              Bagi aparatur dinas/admin bidang, silakan masuk ke dashboard admin untuk mengelola database sarana pariwisata, perizinan hotel, serta pendataan rumah makan per kecamatan.
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-primary" style={{ display: "flex", gap: "0.5rem" }}>
            <ShieldCheck size={18} />
            Masuk Dashboard Admin
          </Link>
        </div>
      </section>
    </div>
  );
}
