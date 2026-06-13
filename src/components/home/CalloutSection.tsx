"use client";

import Link from "next/link";

export default function CalloutSection() {
  return (
    <section className="container">
      <div style={{
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
        <h2 style={{ fontSize: "2.25rem", color: "white", fontFamily: "var(--font-serif)", fontWeight: 700 }}>
          Ingin Mengunjungi Lampung Timur?
        </h2>
        <p style={{ maxWidth: "650px", color: "#d1fae5" }}>
          Gunakan peta interaktif kami untuk melihat sebaran lokasi wisata alam, cagar budaya, ketersediaan hotel/homestay terdekat, serta pilihan kuliner khas di seluruh kecamatan Kabupaten Lampung Timur.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/peta" className="btn btn-accent" style={{ padding: "0.85rem 2rem" }}>
            Buka Peta Wisata
          </Link>
          <Link 
            href="/direktori" 
            className="btn btn-secondary" 
            style={{ 
              border: "1px solid rgba(255,255,255,0.3)", 
              backgroundColor: "transparent", 
              color: "white", 
              padding: "0.85rem 2rem" 
            }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Lihat Direktori
          </Link>
        </div>
      </div>
    </section>
  );
}
