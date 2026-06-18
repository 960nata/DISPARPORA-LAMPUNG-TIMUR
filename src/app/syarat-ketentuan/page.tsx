"use client";

import { motion } from "framer-motion";
import { Scale, FileText, Ban, Globe, RefreshCw, AlertTriangle, Mail } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

const sections = [
  {
    icon: <Globe size={22} />,
    title: "Penggunaan Portal",
    content: [
      "Portal ini merupakan milik dan dikelola oleh DISPARPORA Kabupaten Lampung Timur sebagai media informasi publik resmi.",
      "Pengguna diizinkan mengakses dan mengunduh konten untuk keperluan pribadi, edukasi, dan non-komersial.",
      "Penggunaan konten untuk tujuan komersial atau penerbitan ulang wajib mendapatkan izin tertulis terlebih dahulu.",
      "Pengguna bertanggung jawab penuh atas aktivitas yang dilakukan melalui perangkat dan akun masing-masing.",
    ],
  },
  {
    icon: <FileText size={22} />,
    title: "Kekayaan Intelektual",
    content: [
      "Seluruh konten portal termasuk teks, foto, logo, grafis, dan desain antarmuka dilindungi Undang-Undang Hak Cipta Republik Indonesia.",
      "Logo, nama, dan identitas resmi DISPARPORA Lampung Timur tidak boleh digunakan tanpa izin tertulis.",
      "Foto dan video destinasi wisata yang tercantum dalam portal adalah milik DISPARPORA atau telah mendapat lisensi penggunaan yang sah.",
      "Kutipan singkat (di bawah 300 kata) diperbolehkan dengan menyertakan atribusi sumber yang jelas.",
    ],
  },
  {
    icon: <Ban size={22} />,
    title: "Larangan Penggunaan",
    content: [
      "Dilarang menggunakan portal ini untuk menyebarkan konten yang menyesatkan, fitnah, atau bertentangan dengan hukum.",
      "Dilarang melakukan upaya peretasan, injeksi kode berbahaya, atau serangan siber terhadap sistem portal.",
      "Dilarang mengumpulkan data pengguna lain atau melakukan scraping otomatis tanpa izin resmi.",
      "Dilarang menyalin dan mendistribusikan konten portal untuk tujuan komersial tanpa lisensi.",
      "Pelanggaran terhadap ketentuan ini dapat dikenai sanksi sesuai hukum yang berlaku di Indonesia.",
    ],
  },
  {
    icon: <AlertTriangle size={22} />,
    title: "Batasan Tanggung Jawab",
    content: [
      "DISPARPORA Lampung Timur berupaya menyajikan informasi yang akurat, namun tidak menjamin keakuratan mutlak setiap konten.",
      "Kami tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan informasi dari portal ini.",
      "Tautan ke situs eksternal disediakan untuk kemudahan dan tidak berarti kami mendukung atau bertanggung jawab atas isinya.",
      "Portal dapat mengalami gangguan teknis terjadwal atau tak terduga; kami tidak menjamin ketersediaan 100% sepanjang waktu.",
    ],
  },
  {
    icon: <RefreshCw size={22} />,
    title: "Perubahan Syarat & Ketentuan",
    content: [
      "DISPARPORA berhak memperbarui syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.",
      "Perubahan akan mulai berlaku segera setelah dipublikasikan di halaman ini dengan tanggal pembaruan terbaru.",
      "Penggunaan portal secara berkelanjutan setelah perubahan dianggap sebagai penerimaan atas syarat yang diperbarui.",
      "Pengguna disarankan meninjau halaman ini secara berkala untuk mengetahui pembaruan terkini.",
    ],
  },
];

export default function SyaratKetentuanPage() {
  return (
    <div style={{ paddingBottom: "6rem" }}>

      {/* HERO */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3.5rem" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero3.avif')",
          backgroundSize: "cover", backgroundPosition: "center",
          minHeight: "340px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            <motion.div {...fadeUp(0)}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(190,242,106,0.15)", border: "1px solid rgba(190,242,106,0.3)", borderRadius: "99px", padding: "5px 14px", marginBottom: "1.25rem" }}>
                <Scale size={14} style={{ color: "#BEF26A" }} />
                <span style={{ color: "#BEF26A", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Hukum & Ketentuan</span>
              </div>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)", fontWeight: 900, color: "white", lineHeight: 1.2, maxWidth: "600px", letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              Syarat &amp; Ketentuan
            </motion.h1>
            <motion.p {...fadeUp(0.2)} style={{ fontSize: "clamp(0.9rem, 1.5vw, 1rem)", color: "#d1fae5", maxWidth: "540px", lineHeight: 1.75, margin: 0 }}>
              Dengan mengakses dan menggunakan portal resmi DISPARPORA Lampung Timur, Anda menyetujui syarat dan ketentuan penggunaan yang tercantum di bawah ini.
            </motion.p>
            <motion.p {...fadeUp(0.25)} style={{ marginTop: "1.25rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
              Terakhir diperbarui: 17 Juni 2026
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>

        {/* Intro */}
        <motion.div {...fadeUp(0)} style={{
          background: "linear-gradient(120deg, #0C3B26, #0F5132)",
          borderRadius: "20px", padding: "2rem 2.5rem", marginBottom: "2.5rem",
          display: "flex", gap: "1.5rem", alignItems: "flex-start",
        }}>
          <Scale size={36} style={{ color: "#BEF26A", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 0.5rem" }}>Dasar Hukum Penggunaan Portal</h2>
            <p style={{ color: "#d1fae5", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
              Syarat dan ketentuan ini berlaku bagi seluruh pengguna portal resmi Dinas Pariwisata, Pemuda, dan Olahraga (DISPARPORA) Kabupaten Lampung Timur dan mengacu pada peraturan perundang-undangan yang berlaku di Republik Indonesia, termasuk UU ITE, UU Hak Cipta, dan regulasi terkait layanan informasi publik pemerintah daerah.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {sections.map((sec, i) => (
            <motion.div key={i} {...fadeUp(i * 0.07)} style={{
              background: "white", borderRadius: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)",
              padding: "2rem 2.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #0C3B26, #0F5132)", display: "flex", alignItems: "center", justifyContent: "center", color: "#BEF26A", flexShrink: 0 }}>
                  {sec.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{sec.title}</h3>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sec.content.map((item, j) => (
                  <li key={j} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", fontSize: "0.9rem", color: "#475569", lineHeight: 1.65 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0E9F4F", flexShrink: 0, marginTop: "0.55rem" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Hukum yang berlaku */}
        <motion.div {...fadeUp(0.3)} style={{
          marginTop: "2rem", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(12,59,38,0.06), rgba(15,81,50,0.04))",
          border: "1px solid rgba(14,159,79,0.2)",
          padding: "2rem 2.5rem",
        }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Hukum yang Berlaku</h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.88rem", color: "#475569", lineHeight: 1.65 }}>
            Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui mekanisme yang diatur oleh peraturan perundang-undangan yang berlaku.
          </p>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#0E9F4F", fontWeight: 700 }}>
            info@disparpora.lampungtimurkab.go.id &nbsp;·&nbsp; (0725) 625012
          </p>
        </motion.div>

      </div>
    </div>
  );
}
