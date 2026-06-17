"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface AppEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  status: string;
  image?: string;
}

const defaultEvents: AppEvent[] = [
  {
    id: "ev_1",
    title: "Festival Way Kambas 2026",
    date: "24 - 26 Oktober 2026",
    location: "Pusat Latihan Gajah, Way Kambas",
    desc: "Perayaan tahunan konservasi gajah Sumatera, pentas seni adat, dan pameran kriya kreatif UMKM.",
    status: "Mendatang",
    image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "ev_2",
    title: "Ritual Melasti Bahari",
    date: "12 Maret 2026",
    location: "Pantai Kerang Mas, Labuhan Maringgai",
    desc: "Upacara keagamaan adat umat Hindu Lampung Timur di pesisir timur yang penuh warna dan khidmat.",
    status: "Selesai",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "ev_3",
    title: "Pentas Adat Begawi Desa Wana",
    date: "15 Agustus 2026",
    location: "Desa Adat Wana, Melinting",
    desc: "Gelar ritual adat Begawi Suku Lampung Melinting, menyajikan Tari Melinting klasik dan musik perkusi cetik.",
    status: "Mendatang",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80"
  }
];

export default function EventsSection() {
  const [events, setEvents] = useState<AppEvent[]>(defaultEvents);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setEvents(data); })
      .catch(() => { /* keep default */ });
  }, []);

  return (
    <section className="container" id="agenda" style={{ paddingTop: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2 className="section-heading" style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-serif)", marginBottom: "0.5rem" }}>
          Agenda & Event Mendatang
        </h2>
        <p style={{ maxWidth: "600px", margin: "0 auto" }}>
          Ikuti berbagai keseruan acara kebudayaan, kompetisi olahraga, serta festival pariwisata yang diselenggarakan di Lampung Timur.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card"
            style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--border)" }}
          >
            <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
              {event.image && (
                <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                backgroundColor: event.status === "Mendatang" ? "var(--primary)" : "var(--text-muted)",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "99px",
                fontSize: "0.75rem",
                fontWeight: 700
              }}>
                {event.status}
              </div>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", flexGrow: 1 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>{event.date}</div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{event.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", flexGrow: 1, lineHeight: "1.6" }}>{event.desc}</p>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <MapPin size={14} style={{ color: "var(--accent)" }} />
                <span>{event.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
