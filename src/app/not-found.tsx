import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan | DISPARPORA Lampung Timur",
};

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 60%, #ffffff 100%)", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "520px" }}>
        {/* Big 404 */}
        <div style={{ fontSize: "clamp(5rem, 20vw, 9rem)", fontWeight: 900, color: "#059669", lineHeight: 1, letterSpacing: "-0.05em", marginBottom: "0.5rem", opacity: 0.15, fontFamily: "var(--font-main)" }}>
          404
        </div>

        {/* Icon */}
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #059669, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", margin: "-3rem auto 2rem", boxShadow: "0 8px 24px rgba(5,150,105,0.3)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", fontFamily: "var(--font-main)" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Halaman yang Anda cari sudah dipindahkan, dihapus, atau memang tidak pernah ada. Kembali ke beranda untuk menjelajahi destinasi wisata Lampung Timur.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{ padding: "0.85rem 2rem", backgroundColor: "#059669", color: "white", fontWeight: 700, borderRadius: "12px", border: "none", fontSize: "0.95rem", textDecoration: "none", display: "inline-block" }}
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/direktori"
            style={{ padding: "0.85rem 2rem", backgroundColor: "white", color: "#059669", fontWeight: 700, borderRadius: "12px", border: "1.5px solid #059669", fontSize: "0.95rem", textDecoration: "none", display: "inline-block" }}
          >
            Lihat Direktori
          </Link>
        </div>

        <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#94a3b8" }}>
          DISPARPORA Kabupaten Lampung Timur
        </p>
      </div>
    </div>
  );
}
