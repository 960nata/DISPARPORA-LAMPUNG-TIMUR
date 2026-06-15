"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we are inside the dashboard path; if so, don't show public header
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Profil", path: "/profil" },
    { name: "Peta Wisata", path: "/peta" },
    { name: "Berita", path: "/berita" },
    { name: "Direktori", path: "/direktori" },
    { name: "Kontak", path: "/kontak" },
  ];

  return (
    <header className={`glass-nav ${isScrolled ? "scrolled-card" : ""}`}>
      <div className="container" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        height: isScrolled ? "64px" : "80px",
        transition: "height 0.3s ease"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/logo.avif" alt="Logo DISPARPORA Lampung Timur" style={{ width: "42px", height: "42px", objectFit: "contain" }} />
          <div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              DISPARPORA
            </span>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "-2px" }}>
              Lampung Timur
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: "none", alignItems: "center", gap: "2rem" }} className="desktop-menu">
          <ul style={{ display: "flex", listStyle: "none", gap: "2rem" }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: isActive ? "var(--primary)" : "var(--text-secondary)",
                      borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                      paddingBottom: "4px"
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Action Button & Menu Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/peta" className="header-cta">
            <Compass size={16} />
            <span className="desktop-btn-text">Eksplor Peta</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: "flex",
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer"
            }}
            className="mobile-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: isScrolled ? "78px" : "80px",
          left: isScrolled ? "14px" : 0,
          right: isScrolled ? "14px" : 0,
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          borderLeft: isScrolled ? "1px solid var(--border)" : "none",
          borderRight: isScrolled ? "1px solid var(--border)" : "none",
          borderRadius: isScrolled ? "0 0 10px 10px" : "0",
          boxShadow: isScrolled ? "0 10px 25px rgba(0,0,0,0.05)" : "none",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          zIndex: 999,
          transition: "all 0.3s ease"
        }} className="mobile-menu-open">
          <ul style={{ display: "flex", flexDirection: "column", gap: "1rem", listStyle: "none" }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: isActive ? "var(--primary)" : "var(--text-secondary)",
                      display: "block",
                      padding: "0.5rem 0"
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/peta"
            onClick={() => setIsOpen(false)}
            className="btn btn-primary"
            style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "center", borderRadius: "9999px" }}
          >
            <Compass size={18} />
            Eksplor Peta
          </Link>
        </div>
      )}


    </header>
  );
}
