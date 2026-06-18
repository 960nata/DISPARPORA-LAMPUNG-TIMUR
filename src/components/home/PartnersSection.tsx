"use client";

import { useState, useEffect } from "react";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

const defaultPartners: Partner[] = [
  { id: "part_1", name: "Kemenparekraf RI", logoUrl: "/group_1.avif" },
  { id: "part_2", name: "Pemerintah Provinsi Lampung", logoUrl: "/group_4.avif" },
  { id: "part_3", name: "Pemerintah Kabupaten Lampung Timur", logoUrl: "/group_3.avif" },
  { id: "part_4", name: "Taman Nasional Way Kambas", logoUrl: "/group_2.avif" },
  { id: "part_5", name: "Bank Lampung", logoUrl: "/group_5.avif" },
  { id: "part_6", name: "Pokdarwis Lampung Timur", logoUrl: "/group_6.avif" },
  { id: "part_7", name: "Dinas Pariwisata Lampung Timur", logoUrl: "/group_7.avif" }
];

interface PartnersSectionProps {
  partners?: Partner[];
}

export default function PartnersSection({ partners: propPartners }: PartnersSectionProps) {
  const [partners, setPartners] = useState<Partner[]>(propPartners && propPartners.length > 0 ? propPartners : defaultPartners);

  useEffect(() => {
    fetch("/api/partners")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPartners(data); })
      .catch(() => { /* keep default */ });
  }, []);

  const activePartners = (partners.length > 0 ? partners : defaultPartners).slice(0, 4);

  return (
    <section style={{ backgroundColor: "white", padding: "4rem 0 3rem 0" }}>
      <div className="container" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="section-badge" style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--primary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          backgroundColor: "var(--primary-light)",
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          display: "inline-block",
          marginBottom: "0.75rem"
        }}>
          Mitra & Kerjasama
        </span>
        <h2 className="section-heading" style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em"
        }}>
          Partner Kami
        </h2>
      </div>

      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2rem",
          alignItems: "center",
          justifyItems: "center",
        }}>
          {activePartners.map((p) => {
            const fallbackPng = p.logoUrl.includes(".avif")
              ? p.logoUrl.replace(".avif", ".png")
              : p.logoUrl;

            let logoHeight = "64px";
            if (p.logoUrl.includes("group_2")) logoHeight = "58px";
            else if (p.logoUrl.includes("group_5")) logoHeight = "56px";
            else if (p.logoUrl.includes("group_6")) logoHeight = "72px";

            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100px", width: "100%",
                background: "var(--bg-secondary)", borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "1.25rem",
                boxSizing: "border-box",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(0,0,0,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <picture style={{ display: "block", height: logoHeight }}>
                  <source srcSet={p.logoUrl} type="image/avif" />
                  <img
                    src={fallbackPng}
                    alt={p.name}
                    style={{ height: logoHeight, width: "auto", display: "block", objectFit: "contain" }}
                  />
                </picture>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
