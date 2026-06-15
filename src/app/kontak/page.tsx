"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Send,
  MessageSquare,
  Building2,
  ChevronRight,
  CheckCircle2,
  Share2,
  Video,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay },
});

const infoCards = [
  {
    icon: <MapPin size={24} />,
    color: "#059669",
    bg: "#ecfdf5",
    title: "Alamat Kantor",
    lines: [
      "Jl. Lintas Timur, Kompleks Perkantoran",
      "Pemkab Lampung Timur, Sukadana,",
      "Lampung Timur, 34394",
    ],
  },
  {
    icon: <Phone size={24} />,
    color: "#3b82f6",
    bg: "#eff6ff",
    title: "Telepon",
    lines: ["(0725) 625012"],
  },
  {
    icon: <Mail size={24} />,
    color: "#ec4899",
    bg: "#fdf2f8",
    title: "Email Resmi",
    lines: ["info@disparpora.lampungtimurkab.go.id"],
  },
  {
    icon: <Globe size={24} />,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    title: "Website",
    lines: ["disparpora.lampungtimurkab.go.id"],
  },
  {
    icon: <Clock size={24} />,
    color: "#f59e0b",
    bg: "#fffbeb",
    title: "Jam Operasional",
    lines: ["Senin – Kamis: 07.30 – 15.30 WIB", "Jumat: 07.30 – 15.00 WIB", "Sabtu – Minggu: Tutup"],
  },
  {
    icon: <MessageSquare size={24} />,
    color: "#10b981",
    bg: "#f0fdf4",
    title: "Pengaduan & Layanan",
    lines: ["Gunakan formulir di bawah atau hubungi langsung via telepon / email resmi."],
  },
];

const sosmedLinks = [
  { label: "Instagram", icon: <Share2 size={18} />, href: "#", color: "#ec4899" },
  { label: "Facebook", icon: <Globe size={18} />, href: "#", color: "#3b82f6" },
  { label: "YouTube", icon: <Video size={18} />, href: "#", color: "#ef4444" },
];

export default function KontakPage() {
  const [form, setForm]     = useState({ nama: "", email: "", subjek: "", pesan: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.nama.trim())                              e.nama    = "Nama wajib diisi.";
    if (!form.email.trim())                             e.email   = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid.";
    if (!form.subjek.trim())                            e.subjek  = "Subjek wajib diisi.";
    if (form.pesan.trim().length < 10)                 e.pesan   = "Pesan minimal 10 karakter.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // TODO: replace with real API call, e.g. fetch("/api/contact", { method:"POST", body: JSON.stringify(form) })
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  const fieldStyle = (err?: string): React.CSSProperties => ({
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    border: `1.5px solid ${err ? "#ef4444" : "var(--border)"}`,
    fontSize: "0.9rem",
    color: "var(--text-primary)",
    backgroundColor: "var(--bg-primary)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-main)",
  });

  return (
    <div style={{ paddingBottom: "6rem" }}>

      {/* ─── HERO ─── */}
      <section style={{ width: "100%", padding: "14px", boxSizing: "border-box", marginBottom: "3rem" }}>
        <div className="page-hero-inner" style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5, 46, 35, 0.95) 0%, rgba(6, 78, 59, 0.75) 55%, rgba(6, 78, 59, 0.2) 100%), url('/Gallery/hero3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          borderRadius: "24px",
          overflow: "hidden",
        }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4.5rem", paddingBottom: "4.5rem" }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", fontWeight: 900, color: "white", lineHeight: 1.25, maxWidth: "580px", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.25)", margin: "0 0 1.25rem 0" }}
          >
            Kontak & Informasi DISPARPORA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "1.05rem", color: "#a7f3d0", maxWidth: "520px", lineHeight: 1.7, marginBottom: "2rem" }}
          >
            Sampaikan pertanyaan, masukan, atau kebutuhan layanan Anda kepada kami. Tim DISPARPORA Lampung Timur siap membantu.
          </motion.p>

        </div>
        </div>
      </section>

      {/* ─── INFO CARDS ─── */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.35rem 1rem", borderRadius: "999px", marginBottom: "1rem" }}>Informasi Kontak</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800 }}>Cara Menghubungi Kami</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {infoCards.map((card, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              style={{ backgroundColor: "white", borderRadius: "20px", padding: "1.75rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: card.bg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {card.icon}
              </div>
              <h4 style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0 }}>{card.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {card.lines.map((line, j) => (
                  <p key={j} style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MAP + FORM ─── */}
      <section id="form-kontak" style={{ backgroundColor: "#f8fafc", padding: "5rem 0", scrollMarginTop: "90px" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "start" }}>

          {/* Map embed */}
          <motion.div {...fadeUp(0.05)}>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.25rem" }}>Lokasi Kantor</h3>
            <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "var(--hover-shadow)", border: "1px solid var(--border)", height: "380px" }}>
              <iframe
                src="https://maps.google.com/maps?q=Dinas+Pariwisata+Lampung+Timur+Sukadana&output=embed&z=14"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Kantor DISPARPORA Lampung Timur"
              />
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", margin: 0 }}>Ikuti Kami di Media Sosial</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {sosmedLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "999px", border: `1.5px solid ${s.color}33`, backgroundColor: `${s.color}0e`, color: s.color, fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}
                  >
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div {...fadeUp(0.1)}>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.25rem" }}>Kirim Pesan</h3>

            {sent ? (
              <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #d1fae5", borderRadius: "20px", padding: "3rem", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <CheckCircle2 size={32} style={{ color: "#059669" }} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Pesan Terkirim!</h4>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  Terima kasih. Tim kami akan menghubungi Anda dalam 1–2 hari kerja.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ nama: "", email: "", subjek: "", pesan: "" }); }}
                  style={{ marginTop: "1.5rem", padding: "0.65rem 1.5rem", borderRadius: "999px", backgroundColor: "#059669", color: "white", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
                >
                  Kirim Pesan Lagi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "20px", padding: "2rem", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Nama Lengkap *</label>
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      value={form.nama}
                      onChange={(e) => { setForm({ ...form, nama: e.target.value }); if (errors.nama) setErrors({ ...errors, nama: undefined }); }}
                      style={fieldStyle(errors.nama)}
                    />
                    {errors.nama && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: 0 }}>{errors.nama}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Email *</label>
                    <input
                      type="email"
                      placeholder="email@contoh.com"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                      style={fieldStyle(errors.email)}
                    />
                    {errors.email && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: 0 }}>{errors.email}</p>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Subjek *</label>
                  <input
                    type="text"
                    placeholder="Subjek pesan"
                    value={form.subjek}
                    onChange={(e) => { setForm({ ...form, subjek: e.target.value }); if (errors.subjek) setErrors({ ...errors, subjek: undefined }); }}
                    style={fieldStyle(errors.subjek)}
                  />
                  {errors.subjek && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: 0 }}>{errors.subjek}</p>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Pesan *</label>
                  <textarea
                    rows={5}
                    placeholder="Tuliskan pesan Anda di sini..."
                    value={form.pesan}
                    onChange={(e) => { setForm({ ...form, pesan: e.target.value }); if (errors.pesan) setErrors({ ...errors, pesan: undefined }); }}
                    style={{ ...fieldStyle(errors.pesan), resize: "vertical" }}
                  />
                  {errors.pesan && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: 0 }}>{errors.pesan}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "12px",
                    backgroundColor: loading ? "#6ee7b7" : "#059669",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background-color 0.2s",
                  }}
                >
                  <Send size={18} />
                  {loading ? "Mengirim..." : "Kirim Pesan"}
                </button>

                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
                  Pesan Anda akan dijawab dalam 1–2 hari kerja.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
