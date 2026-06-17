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

  const activePartners = partners.length > 0 ? partners : defaultPartners;
  const doubledPartners = [...activePartners, ...activePartners];

  return (
    <section style={{ backgroundColor: "white", padding: "4rem 0 2rem 0" }}>
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

      <div className="marquee-container">
        <div className="marquee-content">
          {doubledPartners.map((p, idx) => {
            const fallbackPng = p.logoUrl.includes(".avif")
              ? p.logoUrl.replace(".avif", ".png")
              : p.logoUrl;

            let logoHeight = "60px";
            if (p.logoUrl.includes("group_2")) {
              logoHeight = "54px";
            } else if (p.logoUrl.includes("group_5")) {
              logoHeight = "52px";
            } else if (p.logoUrl.includes("group_6")) {
              logoHeight = "68px";
            }

            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "72px" }}>
                <picture style={{ display: "block", height: logoHeight }}>
                  <source srcSet={p.logoUrl} type="image/avif" />
                  <img
                    src={fallbackPng}
                    alt={p.name}
                    className="partner-logo-item"
                    style={{ height: logoHeight, width: "auto", display: "block" }}
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
