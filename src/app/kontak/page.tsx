"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Phone, MapPin, Mail, Share2, Globe, Video } from "lucide-react";

const GREEN  = "#0E9F4F";
const LIME   = "#BEF26A";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

export default function KontakPage() {
  const [form, setForm]       = useState({ nama: "", email: "", subjek: "", pesan: "" });
  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.nama.trim())  e.nama   = "Nama wajib diisi.";
    if (!form.email.trim()) e.email  = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid.";
    if (!form.subjek.trim()) e.subjek = "Subjek wajib diisi.";
    if (form.pesan.trim().length < 10) e.pesan = "Pesan minimal 10 karakter.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  const field = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "0.75rem 0", background: "transparent",
    border: "none", borderBottom: `1.5px solid ${err ? "#ef4444" : "rgba(14,159,79,0.25)"}`,
    fontSize: "0.88rem", color: "var(--text-primary)", outline: "none",
    boxSizing: "border-box", fontFamily: "var(--font-main)", transition: "border-color 0.2s",
  });

  return (
    <div style={{ paddingBottom: "0" }}>

      {/* ─── HERO — identik profil ─── */}
      <section className="page-hero-wrap" style={{ width: "100%", padding: "14px", boxSizing: "border-box" }}>
        <div style={{
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(5,46,35,0.95) 0%, rgba(6,78,59,0.75) 55%, rgba(6,78,59,0.2) 100%), url('/Gallery/hero3.avif')",
          backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
          minHeight: "400px", display: "flex", alignItems: "center",
          borderRadius: "24px", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "4.5rem", paddingBottom: "4.5rem" }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", fontWeight: 900, color: "white", lineHeight: 1.25, maxWidth: "580px", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.25)", margin: "0 0 1.25rem 0" }}>
              Kontak &amp; Informasi<br />DISPARPORA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.3 }}
              style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)", color: "#d1fae5", maxWidth: "600px", lineHeight: 1.75, margin: 0 }}>
              Sampaikan pertanyaan, masukan, atau kebutuhan layanan Anda kepada kami. Tim DISPARPORA Lampung Timur siap membantu sepenuh hati.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── MAIN: INFO kiri + FORM & MAP kanan ─── */}
      <section style={{ padding: "5rem 0 0" }}>
        <div className="container kontak-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "5rem", alignItems: "start" }}>

          {/* LEFT */}
          <motion.div {...fadeUp(0.05)}>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.4rem)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 1.25rem 0" }}>
              Kami selalu siap membantu dan menjawab pertanyaan Anda
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "3rem", maxWidth: "440px" }}>
              Dinas Pariwisata, Kepemudaan, dan Olahraga Kabupaten Lampung Timur terbuka untuk pertanyaan, masukan, dan kerjasama dari seluruh masyarakat dan mitra.
            </p>

            <div className="kontak-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem 3rem" }}>
              <div>
                <p style={{ fontSize: "0.73rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.7rem" }}>Pusat Layanan</p>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 0.3rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={13} color={GREEN} /> (0725) 625012
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.83rem", margin: "0 0 0.1rem" }}>Senin–Kamis: 07.30–15.30 WIB</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.83rem", margin: 0 }}>Jumat: 07.30–15.00 WIB</p>
              </div>
              <div>
                <p style={{ fontSize: "0.73rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.7rem" }}>Lokasi Kami</p>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 0.3rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={13} color={GREEN} /> Sukadana, Lampung Timur
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.83rem", margin: "0 0 0.1rem" }}>Jl. Lintas Timur, Kompleks</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.83rem", margin: 0 }}>Perkantoran Pemkab, 34194</p>
              </div>
              <div>
                <p style={{ fontSize: "0.73rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.7rem" }}>Email</p>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.85rem", margin: 0, display: "flex", alignItems: "flex-start", gap: "6px", wordBreak: "break-all" }}>
                  <Mail size={13} color={GREEN} style={{ flexShrink: 0, marginTop: "2px" }} />
                  info@disparpora.lampungtimurkab.go.id
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.73rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Media Sosial</p>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  {[
                    { icon: <Share2 size={15} />, bg: "#e1306c", href: "#" },
                    { icon: <Globe size={15} />, bg: "#1877f2", href: "#" },
                    { icon: <Video size={15} />, bg: "#ff0000", href: "#" },
                  ].map((s, i) => (
                    <a key={i} href={s.href} style={{ width: "34px", height: "34px", borderRadius: "10px", background: s.bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — form + map */}
          <motion.div {...fadeUp(0.15)} className="kontak-sticky" style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Form card */}
            <div style={{ background: "var(--bg-primary)", border: "1px solid rgba(14,159,79,0.2)", borderRadius: "24px", padding: "2rem", boxShadow: "0 24px 60px -20px rgba(12,59,38,0.12)" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)", margin: "0 0 0.3rem" }}>Kirim Pesan</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0 0 1.75rem" }}>Kami akan membalas dalam 1–2 hari kerja.</p>

              {sent ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <CheckCircle2 size={26} color={GREEN} />
                  </div>
                  <h4 style={{ fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>Pesan Terkirim!</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 1.25rem" }}>Terima kasih, tim kami akan segera menghubungi Anda.</p>
                  <button onClick={() => { setSent(false); setForm({ nama: "", email: "", subjek: "", pesan: "" }); }}
                    style={{ padding: "0.6rem 1.4rem", borderRadius: "999px", background: GREEN, color: "white", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                    Kirim Lagi
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {[
                    { key: "nama",   placeholder: "Nama Lengkap", type: "text" },
                    { key: "email",  placeholder: "Email",        type: "email" },
                    { key: "subjek", placeholder: "Subjek",       type: "text" },
                  ].map(f => (
                    <div key={f.key}>
                      <input type={f.type} placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors({ ...errors, [f.key]: undefined }); }}
                        style={field(errors[f.key as keyof typeof errors])} />
                      {errors[f.key as keyof typeof errors] && <p style={{ color: "#ef4444", fontSize: "0.72rem", margin: "4px 0 0" }}>{errors[f.key as keyof typeof errors]}</p>}
                    </div>
                  ))}
                  <div>
                    <textarea rows={4} placeholder="Pesan"
                      value={form.pesan}
                      onChange={e => { setForm({ ...form, pesan: e.target.value }); setErrors({ ...errors, pesan: undefined }); }}
                      style={{ ...field(errors.pesan), resize: "none" }} />
                    {errors.pesan && <p style={{ color: "#ef4444", fontSize: "0.72rem", margin: "4px 0 0" }}>{errors.pesan}</p>}
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0.85rem", borderRadius: "12px", background: loading ? "#6ee7b7" : GREEN, color: "white", fontWeight: 800, fontSize: "0.9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
                    <Send size={16} /> {loading ? "Mengirim..." : "Kirim Pesan"}
                  </button>
                </form>
              )}
            </div>

          </motion.div>
        </div>
      </section>

      {/* ─── MAP full width ─── */}
      <section style={{ height: "420px", width: "100%", marginTop: "5rem" }}>
        <iframe
          src="https://maps.google.com/maps?q=Dinas+Pariwisata+Kepemudaan+dan+Olahraga+Kabupaten+Lampung+Timur&output=embed&z=15"
          width="100%" height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Lokasi DISPARPORA Lampung Timur"
        />
      </section>

      <style jsx>{`
        @media (max-width: 960px) {
          .kontak-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .kontak-sticky { position: static !important; }
        }
        @media (max-width: 560px) {
          .kontak-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
