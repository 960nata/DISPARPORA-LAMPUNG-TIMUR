"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Guest { name: string; initials: string; color: string; photoUrl?: string; }
interface AppEvent {
  id: string; title: string; date: string; time?: string;
  location: string; desc: string; status: "Mendatang" | "Selesai";
  image?: string; guests?: string;
}

function parseGuests(raw?: string): Guest[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function Avatar({ g, size, border }: { g: Guest; size: number; border: string }) {
  const [imgErr, setImgErr] = useState(false);
  const showImg = g.photoUrl && !imgErr;
  return (
    <div title={g.name} style={{
      width: size, height: size, borderRadius: "50%",
      background: showImg ? "transparent" : g.color,
      border, overflow: "hidden", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {showImg
        ? <img src={g.photoUrl} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setImgErr(true)} />
        : <span style={{ color: "#fff", fontSize: size * 0.3, fontWeight: 800 }}>{g.initials}</span>
      }
    </div>
  );
}

function AvatarStack({ guests, onWhite }: { guests: Guest[]; onWhite?: boolean }) {
  const visible = guests.slice(0, 3);
  const extra = guests.length - 3;
  const borderColor = onWhite ? "#fff" : "rgba(255,255,255,0.9)";
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((g, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -9, position: "relative", zIndex: visible.length - i }}>
          <Avatar g={g} size={30} border={`2.5px solid ${borderColor}`} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: onWhite ? "#e2e8f0" : "rgba(0,0,0,0.4)",
          color: onWhite ? "#64748b" : "#fff",
          fontSize: "0.6rem", fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2.5px solid ${borderColor}`, marginLeft: -9, flexShrink: 0,
        }}>+{extra}</div>
      )}
    </div>
  );
}

function EventCard({ ev, index }: { ev: AppEvent; index: number }) {
  const [isActive, setIsActive] = useState(false);
  const [tapped, setTapped]     = useState(false);
  const active = isActive || tapped;

  const guests = parseGuests(ev.guests);
  const hasBg = !!(ev.image && ev.image.trim());
  const statusColor = ev.status === "Mendatang" ? "#10b981" : "#9ca3af";
  const statusBg    = ev.status === "Mendatang" ? "rgba(16,185,129,0.18)" : "rgba(156,163,175,0.18)";

  return (
    /* outer: framer-motion only for page-in animation — no transform/scale conflict */
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      {/* inner: plain div owns all hover logic */}
      <div
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onTouchEnd={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          e.preventDefault();
          setTapped(p => !p);
        }}
        style={{
          position: "relative", borderRadius: "22px", overflow: "hidden",
          height: "430px", cursor: "pointer", background: "#fff",
          boxShadow: active ? "0 20px 50px -12px rgba(0,0,0,0.35)" : "0 4px 20px -4px rgba(0,0,0,0.12)",
          transform: active ? "translateY(-6px)" : "translateY(0)",
          transition: "box-shadow 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* IMAGE */}
        <div style={{
          position: "absolute",
          left: active ? 0 : "8px", right: active ? 0 : "8px",
          top: active ? 0 : "8px", bottom: active ? 0 : "52%",
          transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
          borderRadius: active ? "22px" : "16px", overflow: "hidden",
          background: hasBg ? "none" : (ev.status === "Mendatang" ? "linear-gradient(135deg,#0C3B26,#0F5132)" : "linear-gradient(135deg,#374151,#6b7280)"),
        }}>
          {hasBg && <img src={ev.image} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div style={{ position: "absolute", inset: 0, background: active ? "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 60%)", transition: "background 0.4s ease" }} />
        </div>

        {/* STATUS BADGE */}
        <span style={{ position: "absolute", top: "4.5%", left: "4.5%", zIndex: 10, padding: "3px 10px", borderRadius: "99px", background: statusBg, color: statusColor, fontSize: "0.68rem", fontWeight: 800, border: `1px solid ${statusColor}40`, backdropFilter: "blur(6px)" }}>{ev.status}</span>

        {/* HOVER OVERLAY */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5, padding: "20px", opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.3s ease, transform 0.3s ease", pointerEvents: active ? "auto" : "none" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{ev.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Calendar size={12} style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{ev.date}{ev.time ? ` · ${ev.time}` : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <MapPin size={12} style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.8)" }}>{ev.location}</span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ev.desc}</p>
          {guests.length > 0 && (
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "0.63rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Bintang Tamu</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AvatarStack guests={guests} />
                <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{guests.slice(0,2).map(g => g.name).join(", ")}{guests.length > 2 ? ` +${guests.length - 2}` : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* NORMAL STATE */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "48%", background: "#fff", borderRadius: "0 0 22px 22px",
          padding: "14px 18px 16px",
          display: "flex", flexDirection: "column", gap: "6px",
          opacity: active ? 0 : 1, transition: "opacity 0.2s ease",
          pointerEvents: active ? "none" : "auto", zIndex: 4,
        }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ev.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <span style={{ fontSize: "0.74rem", color: "#334155", fontWeight: 600 }}>{ev.date}{ev.time ? <span style={{ color: "#94a3b8", fontWeight: 400 }}> · {ev.time}</span> : null}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <MapPin size={12} style={{ color: "#94a3b8", flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "0.74rem", color: "#64748b", lineHeight: 1.4 }}>{ev.location}</span>
          </div>
          {guests.length > 0 && (
            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 6px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>Bintang Tamu</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AvatarStack guests={guests} onWhite />
                <span style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 600 }}>
                  {guests.slice(0,2).map(g => g.name).join(", ")}{guests.length > 2 ? ` +${guests.length - 2}` : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AgendaPage() {
  const [events, setEvents]   = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"Semua" | "Mendatang" | "Selesai">("Semua");

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "Semua" ? events : events.filter(e => e.status === filter);

  return (
    <div style={{ paddingBottom: "5rem" }}>

      {/* HERO */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero1.avif')",
          backgroundSize: "cover", backgroundPosition: "center",
          minHeight: "380px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "4rem" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", fontWeight: 900, color: "white", lineHeight: 1.25, maxWidth: "580px", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.25)", margin: "0 0 1.25rem 0" }}>
              Agenda &amp; Event<br />Lampung Timur
            </h1>
            <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", color: "#d1fae5", maxWidth: "520px", lineHeight: 1.75, margin: 0 }}>
              Jadwal kegiatan, festival budaya, dan event olahraga yang diselenggarakan DISPARPORA Kabupaten Lampung Timur.
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "0 1.5rem" }}>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "2.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {(["Semua", "Mendatang", "Selesai"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.55rem 1.25rem", borderRadius: "99px",
              border: filter === f ? "1px solid transparent" : "1px solid var(--border)",
              background: filter === f ? "var(--primary)" : "var(--bg-secondary)",
              color: filter === f ? "#fff" : "var(--text-secondary)",
              fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease",
            }}>{f}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {filtered.length} event
          </span>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>Memuat agenda...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: "20px" }}>
            <Calendar size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
            <h3 style={{ color: "var(--text-primary)", fontWeight: 700 }}>Tidak ada event ditemukan</h3>
          </div>
        ) : (
          <motion.div layout style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
          }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((ev, i) => <EventCard key={ev.id} ev={ev} index={i} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
