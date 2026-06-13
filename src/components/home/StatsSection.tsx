"use client";

import { TreePine, Palmtree, Compass } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3.5rem", alignItems: "center", marginTop: "1rem" }}>
      {/* Left Column: Intro text, social media, statistics count */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: "1.2", fontFamily: "var(--font-main)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Mengapa Ribuan Petualang Memilih WANDER.lamtim?
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>
          Dari rimba konservasi gajah liar yang mendunia hingga keindahan bahari pesisir pantai timur, kami menyajikan akses eksplorasi terpadu untuk petualangan yang aman, autentik, dan tak terlupakan.
        </p>
        
        {/* Social Icons Row */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {[
            { 
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              ), 
              link: "https://instagram.com" 
            },
            { 
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              ), 
              link: "https://twitter.com" 
            },
            { 
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              ), 
              link: "https://facebook.com" 
            }
          ].map((soc, idx) => (
            <a
              key={idx}
              href={soc.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                backgroundColor: "white",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {soc.icon}
            </a>
          ))}
        </div>

        {/* Counts Row */}
        <div style={{ display: "flex", gap: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
          {[
            { count: "45+", label: "Destinasi Terdaftar" },
            { count: "40+", label: "Akomodasi Hotel" },
            { count: "220+", label: "Kuliner Kreatif" }
          ].map((cnt, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <h4 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>{cnt.count}</h4>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{cnt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Horizontal Feature Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {[
          {
            title: "Konservasi Gajah Way Kambas",
            desc: "Pusat konservasi internasional gajah Sumatera yang menawarkan edukasi liar dan ekowisata savana.",
            icon: <TreePine size={24} color="#059669" />,
            bgColor: "#ecfdf5"
          },
          {
            title: "Pesona Bahari Kerang Mas",
            desc: "Pantai pesisir timur yang bersih dengan gazebo santai, wahana ATV, dan sajian kuliner laut segar.",
            icon: <Palmtree size={24} color="#d97706" />,
            bgColor: "#fef3c7"
          },
          {
            title: "Situs Megalitikum Pugung Raharjo",
            desc: "Taman purbakala prasejarah yang menyimpan punden berundak unik, benteng parit tanah, dan arca kuno.",
            icon: <Compass size={24} color="#3b82f6" />,
            bgColor: "#dbeafe"
          }
        ].map((feat, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              backgroundColor: "white",
              padding: "1.25rem 1.5rem",
              borderRadius: "20px"
            }}
          >
            {/* Icon Container */}
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: feat.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {feat.icon}
            </div>
            {/* Text info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>{feat.title}</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
