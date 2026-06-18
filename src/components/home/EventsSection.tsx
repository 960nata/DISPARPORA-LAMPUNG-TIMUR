"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";

interface Guest { name: string; initials: string; color: string; photoUrl?: string; }
interface AppEvent {
  id: string; title: string; date: string; time?: string;
  location: string; desc: string; status: string;
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

const defaultEvents: AppEvent[] = [
  {
    id: "ev_1", title: "Festival Way Kambas 2026",
    date: "24 Oktober 2026", time: "08.00 WIB",
    location: "Pusat Latihan Gajah, Way Kambas",
    desc: "Perayaan tahunan konservasi gajah Sumatera, pentas seni adat, dan pameran kriya kreatif UMKM Lampung Timur.",
    status: "Mendatang", image: "/Gallery/Taman Nasional Way Kambas.avif",
    guests: JSON.stringify([
      { name: "Marsan, M.Pd.", initials: "MS", color: "#6366f1", photoUrl: "/leaders/kadis.avif" },
      { name: "Ela Siti N.", initials: "EN", color: "#10b981", photoUrl: "/leaders/bupati.png" },
      { name: "Azwar Hadi", initials: "AH", color: "#f59e0b", photoUrl: "/leaders/wabup.png" },
    ]),
  },
  {
    id: "ev_2", title: "Ritual Melasti Bahari",
    date: "12 Maret 2026", time: "06.00 WIB",
    location: "Pantai Kerang Mas, Labuhan Maringgai",
    desc: "Upacara keagamaan adat umat Hindu Lampung Timur di pesisir timur yang penuh warna dan khidmat.",
    status: "Selesai", image: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif",
    guests: JSON.stringify([
      { name: "Reza Aulia", initials: "RA", color: "#6366f1" },
      { name: "Dita Pratiwi", initials: "DP", color: "#ec4899" },
      { name: "Farhan Naufal", initials: "FN", color: "#f59e0b" },
    ]),
  },
  {
    id: "ev_3", title: "Pentas Adat Begawi Desa Wana",
    date: "15 Agustus 2026", time: "19.00 WIB",
    location: "Desa Adat Wana, Melinting",
    desc: "Gelar ritual adat Begawi Suku Lampung Melinting, menyajikan Tari Melinting klasik dan musik perkusi cetik.",
    status: "Mendatang", image: "/Gallery/image.avif",
    guests: JSON.stringify([
      { name: "Marsan, M.Pd.", initials: "MS", color: "#8b5cf6", photoUrl: "/leaders/kadis.avif" },
      { name: "Azwar Hadi", initials: "AH", color: "#0891b2", photoUrl: "/leaders/wabup.png" },
    ]),
  },
];

function EventCard({ event, index }: { event: AppEvent; index: number }) {
  const [active, setActive] = useState(false);
  const [tapped, setTapped] = useState(false);
  const isActive = active || tapped;

  const guests = parseGuests(event.guests);
  const hasBg = !!(event.image?.trim());
  const statusColor = event.status === "Mendatang" ? "#10b981" : "#9ca3af";
  const statusBg    = event.status === "Mendatang" ? "rgba(16,185,129,0.15)" : "rgba(156,163,175,0.15)";
  const guestNames  = guests.map(g => g.name).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onTouchEnd={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          e.preventDefault();
          setTapped(p => !p);
        }}
        style={{
          position: "relative", borderRadius: "22px", overflow: "hidden",
          height: "430px", cursor: "pointer", background: "#fff",
          boxShadow: isActive
            ? "0 24px 56px -12px rgba(0,0,0,0.32)"
            : "0 4px 24px -4px rgba(0,0,0,0.10)",
          transform: isActive ? "translateY(-6px)" : "translateY(0)",
          transition: "box-shadow 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* ── IMAGE ── */}
        <div style={{
          position: "absolute",
          left: isActive ? 0 : "8px",
          right: isActive ? 0 : "8px",
          top: isActive ? 0 : "8px",
          bottom: isActive ? 0 : "52%",
          transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
          borderRadius: isActive ? "22px" : "16px",
          overflow: "hidden",
          background: hasBg ? "none" : (event.status === "Mendatang" ? "linear-gradient(135deg,#0C3B26,#0F5132)" : "linear-gradient(135deg,#374151,#6b7280)"),
        }}>
          {hasBg && (
            <img src={event.image} alt={event.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: isActive
              ? "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 60%)",
            transition: "background 0.4s ease",
          }} />
        </div>

        {/* ── STATUS BADGE ── */}
        <span style={{
          position: "absolute", top: "4.5%", left: "4.5%", zIndex: 10,
          padding: "3px 10px", borderRadius: "99px",
          background: statusBg, color: statusColor,
          fontSize: "0.68rem", fontWeight: 800,
          border: `1px solid ${statusColor}40`,
          backdropFilter: "blur(6px)",
        }}>{event.status}</span>

        {/* ── HOVER OVERLAY CONTENT ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5,
          padding: "20px",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: isActive ? "auto" : "none",
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            {event.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Calendar size={12} style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              {event.date}{event.time ? ` · ${event.time}` : ""}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <MapPin size={12} style={{ color: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.8)" }}>{event.location}</span>
          </div>
          <p style={{
            margin: "0 0 12px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{event.desc}</p>
          {guests.length > 0 && (
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "0.63rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Bintang Tamu</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AvatarStack guests={guests} />
                <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                  {guests.slice(0,2).map(g => g.name).join(", ")}{guests.length > 2 ? ` +${guests.length - 2}` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── NORMAL STATE: white info area ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "48%",
          background: "#fff",
          borderRadius: "0 0 22px 22px",
          padding: "14px 18px 16px",
          display: "flex", flexDirection: "column", gap: "6px",
          opacity: isActive ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: isActive ? "none" : "auto",
          zIndex: 4,
        }}>
          {/* Title */}
          <h3 style={{
            margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{event.title}</h3>

          {/* Date + time */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <span style={{ fontSize: "0.74rem", color: "#334155", fontWeight: 600 }}>
              {event.date}{event.time ? <span style={{ color: "#94a3b8", fontWeight: 400 }}> · {event.time}</span> : null}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <MapPin size={12} style={{ color: "#94a3b8", flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "0.74rem", color: "#64748b", lineHeight: 1.4 }}>{event.location}</span>
          </div>

          {/* BINTANG TAMU */}
          {guests.length > 0 && (
            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 6px", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>Bintang Tamu</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AvatarStack guests={guests} />
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

export default function EventsSection() {
  const [events, setEvents] = useState<AppEvent[]>(defaultEvents);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setEvents(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="container" id="agenda" style={{ paddingTop: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)", marginBottom: "0.5rem" }}>
          Agenda &amp; Event Mendatang
        </h2>
        <p style={{ maxWidth: "600px", margin: "0 auto" }}>
          Ikuti berbagai keseruan acara kebudayaan, kompetisi olahraga, serta festival pariwisata yang diselenggarakan di Lampung Timur.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {events.slice(0, 3).map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
      </div>
    </section>
  );
}
