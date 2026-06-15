"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  authorName: string;
  createdAt: string;
  status: string;
  tags: string;
}

interface NewsSectionProps {
  posts?: Post[];
}

const defaultNews: Post[] = [
  {
    id: "post_1",
    title: "Festival Way Kambas Kembali Digelar Tahun Ini",
    slug: "festival-way-kambas-kembali-digelar-tahun-ini",
    content: "Pemerintah Kabupaten Lampung Timur melalui Dinas Pariwisata mengumumkan kembalinya gelaran tahunan legendaris, Festival Way Kambas. Event ini akan menampilkan atraksi edukasi gajah Sumatera, parade kebudayaan adat Lampung, pameran produk kriya kreatif khas daerah, serta kompetisi olahraga pemuda.",
    imageUrl: "/Gallery/Taman%20Nasional%20Way%20Kambas.avif",
    authorName: "Editor Berita Dinas",
    createdAt: "2026-06-11T09:50:59.815Z",
    status: "published",
    tags: "FESTIVAL"
  },
  {
    id: "post_2",
    title: "Pantai Kerang Mas Alami Lonjakan Pengunjung Sepanjang Libur Lebaran",
    slug: "pantai-kerang-mas-alami-lonjakan-pengunjung-sepanjang-libur-lebaran",
    content: "Destinasi wisata bahari andalan Lampung Timur, Pantai Kerang Mas, mencatat rekor kunjungan wisatawan tertinggi selama liburan pekan ini. Ribuan wisatawan lokal dan luar daerah memadati pantai untuk menikmati gazebo pesisir, kuliner tangkapan laut segar, penyewaan ban, serta wahana ATV.",
    imageUrl: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif",
    authorName: "Editor Berita Dinas",
    createdAt: "2026-06-08T09:50:59.819Z",
    status: "published",
    tags: "BERITA"
  },
  {
    id: "post_3",
    title: "Pembinaan & Sertifikasi Pemandu Wisata Desa Wisata Lampung Timur",
    slug: "pembinaan-sertifikasi-pemandu-wisata-desa-wisata-lampung-timur",
    content: "Dalam rangka meningkatkan mutu layanan hospitality, Bidang Pengembangan Destinasi Dinas Pariwisata Lampung Timur menyelenggarakan pembinaan intensif dan sertifikasi bagi 40 pemandu desa wisata. Program ini melibatkan desa wisata binaan seperti Braja Harjosari dan Desa Tradisional Wana.",
    imageUrl: "/Gallery/pugung_raharjo.avif",
    authorName: "Admin Bidang Dinas",
    createdAt: "2026-06-03T09:50:59.819Z",
    status: "published",
    tags: "BERITA"
  },
  {
    id: "post_4",
    title: "Ekspor Kerajinan Tapis Lampung Timur Tumbuh Pesat Didorong Pasar Digital",
    slug: "ekspor-tapis-lampung-timur-tumbuh-pesat",
    content: "Kerajinan kain tapis khas Lampung Timur mengalami lonjakan permintaan ekspor luar negeri sepanjang triwulan pertama tahun ini, didukung program Go Digital dari Dinas Pariwisata dan Ekonomi Kreatif.",
    imageUrl: "/Gallery/tapis_lampung.avif",
    authorName: "Humas Pemkab",
    createdAt: "2026-06-01T09:50:59.819Z",
    status: "published",
    tags: "BERITA"
  }
];

export default function NewsSection({ posts = [] }: NewsSectionProps) {
  // Use posts if we have 4 or more, otherwise fallback to defaultNews
  const activeNews = posts.length >= 4 ? posts : defaultNews;
  const featured = activeNews[0];
  const listItems = activeNews.slice(1, 4);

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to get tag capsule styling
  const getTag = (newsItem: Post) => {
    const rawTag = newsItem.tags ? newsItem.tags.split(",")[0].trim() : "BERITA";
    return rawTag.toUpperCase();
  };

  return (
    <section className="container">
      {/* Header Row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "2rem"
      }}>
        <h2 className="section-heading" style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1e293b", fontFamily: "var(--font-main)" }}>
          Berita & Informasi Terbaru
        </h2>
        <Link 
          href="/berita" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "var(--primary)",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "var(--primary-hover)"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--primary)"}
        >
          Semua Berita <ArrowRight size={14} style={{ marginLeft: "0.25rem" }} />
        </Link>
      </div>

      {/* Grid Content */}
      <div className="news-layout-grid">
        {/* Left Column: Featured News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="news-featured-card"
        >
          <img
            src={featured.imageUrl}
            alt={featured.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1
            }}
          />
          <div className="news-featured-overlay" />
          
          <div className="news-featured-content">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid rgba(5, 150, 105, 0.15)",
                padding: "0.25rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.05em"
              }}>
                {getTag(featured)}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 500 }}>
                {formatDate(featured.createdAt)}
              </span>
            </div>
            
            <Link href={`/berita/${featured.id || featured.slug}`}>
              <h3 className="news-featured-title" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#a7f3d0"} onMouseOut={(e) => e.currentTarget.style.color = "white"}>
                {featured.title}
              </h3>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: List of 3 news */}
        <div className="news-side-stack">
          {listItems.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="news-side-card"
            >
              <div className="news-side-img-container">
                <img src={item.imageUrl} alt={item.title} className="news-side-img" />
              </div>
              
              <div className="news-side-content">
                <div className="news-side-meta">
                  <span style={{
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    border: "1px solid rgba(5, 150, 105, 0.15)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    letterSpacing: "0.03em"
                  }}>
                    {getTag(item)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <Link href={`/berita/${item.id || item.slug}`}>
                  <h4 className="news-side-title" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}>
                    {item.title}
                  </h4>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
