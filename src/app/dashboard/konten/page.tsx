"use client";

import Link from "next/link";
import { useAdmin } from "@/contexts/AdminContext";
import { Building2, Mic2, CalendarDays, Handshake } from "lucide-react";

const SECTIONS = [
  {
    href: "/dashboard/konten/organisasi",
    icon: Building2,
    title: "Struktur Organisasi",
    desc: "Kelola susunan pejabat dinas yang ditampilkan di portal.",
    color: "var(--dash-primary)",
  },
  {
    href: "/dashboard/konten/sambutan",
    icon: Mic2,
    title: "Sambutan Kepala Daerah",
    desc: "Edit teks dan foto sambutan yang ditampilkan di halaman utama.",
    color: "var(--dash-success)",
  },
  {
    href: "/dashboard/konten/agenda",
    icon: CalendarDays,
    title: "Agenda & Event",
    desc: "Kelola agenda dan event yang akan ditampilkan di portal wisata.",
    color: "var(--dash-warning)",
  },
  {
    href: "/dashboard/konten/partner",
    icon: Handshake,
    title: "Partner Kami",
    desc: "Kelola logo dan nama mitra yang ditampilkan di halaman utama.",
    color: "var(--dash-danger)",
  },
];

export default function KontenPage() {
  const { user } = useAdmin();

  if (!user) return null;
  const allowed = user.role === "superadmin" || user.role === "admin_dinas";
  if (!allowed) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600 }}>Akses Ditolak</p>
        <p style={{ fontSize: "0.875rem" }}>Halaman ini hanya dapat diakses oleh superadmin dan admin_dinas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "var(--font-main)" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.02em" }}>
          Manajemen Konten
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Edit konten yang ditampilkan pada halaman utama portal wisata.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.href} className="dash-card dash-card-hover" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: `${section.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} style={{ color: section.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--dash-text)", marginBottom: "4px" }}>{section.title}</div>
                <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>{section.desc}</p>
              </div>
              <Link
                href={section.href}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  marginTop: "auto", padding: "8px 16px", borderRadius: "10px",
                  background: section.color, color: "#fff",
                  fontWeight: 600, fontSize: "0.825rem", textDecoration: "none",
                  width: "fit-content"
                }}
              >
                Kelola &rarr;
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
