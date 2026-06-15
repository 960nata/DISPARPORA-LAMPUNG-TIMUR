"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Map } from "lucide-react";

export default function HeroSection() {
  const [btn1Hover, setBtn1Hover] = useState(false);
  const [btn2Hover, setBtn2Hover] = useState(false);
  const [btn2Active, setBtn2Active] = useState(false);

  return (
    <section style={{ 
      width: "100%", 
      backgroundColor: "white", 
      padding: "14px",
      marginTop: "0px",
      boxSizing: "border-box"
    }}>
      <div className="home-hero-inner" style={{
        position: "relative",
        backgroundImage: "linear-gradient(to right, rgba(5, 46, 35, 0.95) 0%, rgba(6, 78, 59, 0.7) 50%, rgba(6, 78, 59, 0.15) 100%), url('/hero%20section/hero%201.avif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "10rem 0 9rem 0",
        color: "white",
        textAlign: "left",
        borderRadius: "24px",
        boxShadow: "var(--card-shadow)",
        overflow: "hidden"
      }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2rem", maxWidth: "800px", margin: "0" }}>
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <Compass size={16} />
              Bumei Tuwah Bepadan
            </motion.div>

            <motion.h1
              className="home-hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                fontFamily: "var(--font-main)",
                fontWeight: 800,
                maxWidth: "800px",
                lineHeight: "1.2",
                textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                color: "white",
                letterSpacing: "-0.03em",
                textTransform: "uppercase"
              }}
            >
              Jelajahi Pesona Alam & Budaya Lampung Timur
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                maxWidth: "680px",
                color: "#d1fae5",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Temukan petualangan autentik dari rimba suaka margasatwa Way Kambas, hamparan asri pantai pesisir timur, hingga warisan sejarah purbakala.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "flex-start", marginTop: "1rem" }}
            >
              <Link
                href="/peta"
                className="cta-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "12px",
                  padding: "0.75rem 2rem",
                  backgroundColor: btn1Hover ? "#e2e8f0" : "#ffffff",
                  color: "#065f46",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.15)"
                }}
                onMouseEnter={() => setBtn1Hover(true)}
                onMouseLeave={() => setBtn1Hover(false)}
              >
                <Map size={18} />
                Peta Wisata
              </Link>
              <Link
                href="/direktori"
                className="cta-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  padding: "0.75rem 2rem",
                  backgroundColor: btn2Hover ? "#e2e8f0" : "rgba(255,255,255,0.15)",
                  color: btn2Hover ? "#065f46" : "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "1px solid rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={() => setBtn2Hover(true)}
                onMouseLeave={() => { setBtn2Hover(false); setBtn2Active(false); }}
                onMouseDown={() => setBtn2Active(true)}
                onMouseUp={() => setBtn2Active(false)}
              >
                Lihat Direktori
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
