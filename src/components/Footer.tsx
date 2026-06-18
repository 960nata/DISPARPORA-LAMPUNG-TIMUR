"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: "#0b1329",
      color: "#f8fafc",
      padding: "4rem 0 2rem 0",
      marginTop: "auto",
      borderTop: "1px solid #1e293b"
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "3rem",
          marginBottom: "3rem"
        }}>
          {/* Logo and About */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img src="/logo.avif" alt="Logo DISPARPORA Lampung Timur" style={{ width: "42px", height: "42px", objectFit: "contain" }} />
              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white" }}>DISPARPORA</h4>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "-2px" }}>
                  Lampung Timur
                </p>
              </div>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: "1.6" }}>
              Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur berkomitmen untuk mempromosikan pariwisata daerah, membina kepemudaan, serta memajukan prestasi olahraga di Lampung Timur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Tautan Pintas</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <Link href="/" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/profil" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Profil Dinas
                </Link>
              </li>
              <li>
                <Link href="/peta" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Peta Wisata
                </Link>
              </li>
              <li>
                <Link href="/berita" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Berita
                </Link>
              </li>
              <li>
                <Link href="/direktori" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Direktori Destinasi
                </Link>
              </li>
              <li>
                <Link href="/kontak" style={{ color: "#94a3b8", fontSize: "0.9rem" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Kontak Kantor</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", color: "#94a3b8", fontSize: "0.9rem" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <MapPin size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
                <span>Jl. Lintas Timur, Kompleks Perkantoran Pemkab Lampung Timur, Sukadana, Lampung Timur, 34394</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Phone size={18} style={{ color: "var(--primary)" }} />
                <span>(0725) 625012</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Mail size={18} style={{ color: "var(--primary)" }} />
                <span>info@disparpora.lampungtimurkab.go.id</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Globe size={18} style={{ color: "var(--primary)" }} />
                <span>disparpora.lampungtimurkab.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: "1px solid #1e293b",
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.8rem",
          color: "#64748b"
        }} className="footer-bottom">
          <p style={{ color: "#64748b" }}>
            © {new Date().getFullYear()} Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur. Hak Cipta Dilindungi.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href="/kebijakan-privasi" style={{ color: "#64748b" }} onMouseOver={e => (e.currentTarget.style.color = "white")} onMouseOut={e => (e.currentTarget.style.color = "#64748b")}>Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" style={{ color: "#64748b" }} onMouseOver={e => (e.currentTarget.style.color = "white")} onMouseOut={e => (e.currentTarget.style.color = "#64748b")}>Syarat & Ketentuan</Link>
            <a href="https://hadinata.dev" target="_blank" rel="noopener noreferrer" style={{ color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
              onMouseOver={e => (e.currentTarget.style.color = "white")}
              onMouseOut={e => (e.currentTarget.style.color = "#64748b")}>
              Powered by <strong style={{ color: "var(--primary)", marginLeft: "3px" }}>hadinata.dev</strong>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
