"use client";

import Link from "next/link";

export default function CalloutSection() {
  return (
    <section className="container">
      <div className="callout-inner" style={{
        background: "linear-gradient(135deg, #064e3b, #065f46)",
        color: "white",
        borderRadius: "24px",
        padding: "4rem 3rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        boxShadow: "0 20px 25px -5px rgba(5,150,105,0.2)"
      }}>
        <h2 className="section-heading" style={{ fontSize: "2.25rem", color: "white", fontFamily: "var(--font-serif)", fontWeight: 700 }}>
          Ingin Mengunjungi Lampung Timur?
        </h2>
        <p style={{ maxWidth: "650px", color: "#d1fae5" }}>
          Gunakan peta interaktif kami untuk melihat sebaran lokasi wisata alam, cagar budaya, ketersediaan hotel/homestay terdekat, serta pilihan kuliner khas di seluruh kecamatan Kabupaten Lampung Timur.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
          <Link
            href="/peta"
            className="btn cta-btn"
            style={{ padding: "0.85rem 2rem", backgroundColor: "white", color: "#065f46", fontWeight: 700, borderRadius: "12px", border: "none" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
          >
            Buka Peta Wisata
          </Link>
          <Link
            href="/direktori"
            className="btn cta-btn"
            style={{ padding: "0.85rem 2rem", backgroundColor: "rgba(255,255,255,0.12)", color: "white", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.4)" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"}
          >
            Lihat Direktori
          </Link>
        </div>
      </div>
    </section>
  );
}
