"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert, ShieldCheck, RefreshCw, MapPin, Globe, Volume2, VolumeX, AlertTriangle,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import type { AttackMapEvent } from "@/components/admin/AttackMap";

const AttackMap = dynamic(() => import("@/components/admin/AttackMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "380px", borderRadius: "14px", background: "var(--dash-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-muted)", fontSize: "0.85rem" }}>
      Memuat peta…
    </div>
  ),
});

interface SecEvent {
  id: string;
  createdAt: string;
  type: string;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  path: string | null;
  method: string | null;
  userAgent: string | null;
  detail: string | null;
  lat: number | null;
  lng: number | null;
}

interface Summary {
  total24h: number;
  total7d: number;
  byType24h: Record<string, number>;
  topCountries: { country: string; count: number }[];
  topIps: { ip: string; count: number }[];
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  login_failed:       { label: "Login Gagal",            color: "var(--dash-warning)", bg: "rgba(245,158,11,0.12)" },
  login_rate_limited: { label: "Diblokir (Brute-force)", color: "var(--dash-danger)",  bg: "rgba(239,68,68,0.12)" },
  unauthorized:       { label: "Akses Ditolak",          color: "var(--dash-danger)",  bg: "rgba(239,68,68,0.12)" },
  suspicious_request: { label: "Probe Mencurigakan",     color: "#a855f7",             bg: "rgba(168,85,247,0.14)" },
};

function metaFor(type: string) {
  return TYPE_META[type] ?? { label: type, color: "var(--dash-text-muted)", bg: "var(--dash-surface-hover)" };
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}d lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    setTimeout(() => ctx.close().catch(() => {}), 400);
  } catch {}
}

export default function KeamananPage() {
  const { user } = useAdmin();
  const [events, setEvents] = useState<SecEvent[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [alarm, setAlarm] = useState(false);
  const [sound, setSound] = useState(false);
  const lastIdRef = useRef<string | null>(null);
  const firstLoadRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/security/events", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const evts: SecEvent[] = data.events ?? [];
      setSummary(data.summary ?? null);

      const newestId = evts[0]?.id ?? null;
      if (!firstLoadRef.current && newestId && newestId !== lastIdRef.current) {
        // New attack(s) arrived → flash the alarm.
        setAlarm(true);
        if (sound) beep();
        setTimeout(() => setAlarm(false), 4000);
      }
      lastIdRef.current = newestId;
      firstLoadRef.current = false;
      setEvents(evts);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [sound]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (user && user.role !== "superadmin") {
    return (
      <div className="dash-card" style={{ padding: "32px", textAlign: "center", maxWidth: "520px", margin: "40px auto" }}>
        <ShieldAlert size={40} style={{ color: "var(--dash-danger)", margin: "0 auto 14px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)" }}>Akses Ditolak</h2>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.9rem" }}>
          Hanya Super Admin yang dapat membuka monitoring keamanan.
        </p>
      </div>
    );
  }

  const mapEvents: AttackMapEvent[] = events
    .filter((e) => e.lat != null && e.lng != null)
    .map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, type: metaFor(e.type).label, ip: e.ip, city: e.city, country: e.country, createdAt: e.createdAt }));

  const stat = (n: number | undefined) => (typeof n === "number" ? n : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Alarm banner */}
      {alarm && (
        <div className="atk-alarm" style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "14px",
          background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.45)", color: "var(--dash-danger)", fontWeight: 800,
        }}>
          <AlertTriangle size={20} />
          Serangan / aktivitas mencurigakan baru terdeteksi!
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--dash-text)", margin: "0 0 6px", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={22} style={{ color: "var(--dash-primary)" }} /> Monitoring Keamanan
          </h1>
          <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "640px" }}>
            Deteksi percobaan serangan: login gagal (brute-force), IP terblokir, akses ditolak, dan probe scanner/hacker — lengkap dengan lokasi. Auto-refresh tiap 15 detik.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setSound((s) => !s)} title={sound ? "Matikan suara" : "Nyalakan suara alarm"} className="dash-header-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 12px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={load} className="dash-header-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        {[
          { label: "Kejadian 24 Jam", value: stat(summary?.total24h), color: "var(--dash-primary)" },
          { label: "Login Gagal (24j)", value: stat(summary?.byType24h?.login_failed), color: "var(--dash-warning)" },
          { label: "Diblokir (24j)", value: stat(summary?.byType24h?.login_rate_limited), color: "var(--dash-danger)" },
          { label: "Probe Hacker (24j)", value: stat(summary?.byType24h?.suspicious_request), color: "#a855f7" },
        ].map((c) => (
          <div key={c.label} className="dash-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--dash-text-muted)", textTransform: "uppercase" }}>{c.label}</div>
            <div style={{ fontSize: "1.9rem", fontWeight: 900, color: c.color, marginTop: "4px" }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="dash-card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "0.9rem", fontWeight: 700, color: "var(--dash-text)" }}>
          <MapPin size={17} style={{ color: "var(--dash-danger)" }} /> Peta Lokasi Serangan
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dash-text-muted)" }}>({mapEvents.length} titik berkoordinat)</span>
        </div>
        <AttackMap events={mapEvents} />
      </div>

      {/* Top countries / IPs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
        <div className="dash-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 700, color: "var(--dash-text)" }}>
            <Globe size={16} /> Negara Teratas (7 hari)
          </div>
          {summary?.topCountries?.length ? summary.topCountries.map((c) => (
            <div key={c.country} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.85rem", color: "var(--dash-text-soft)", borderBottom: "1px solid var(--dash-border)" }}>
              <span>{c.country}</span><span style={{ fontWeight: 700 }}>{c.count}</span>
            </div>
          )) : <div style={{ fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>Belum ada data.</div>}
        </div>
        <div className="dash-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 700, color: "var(--dash-text)" }}>
            <ShieldAlert size={16} /> IP Paling Sering (7 hari)
          </div>
          {summary?.topIps?.length ? summary.topIps.map((c) => (
            <div key={c.ip} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.85rem", color: "var(--dash-text-soft)", borderBottom: "1px solid var(--dash-border)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              <span>{c.ip}</span><span style={{ fontWeight: 700 }}>{c.count}</span>
            </div>
          )) : <div style={{ fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>Belum ada data.</div>}
        </div>
      </div>

      {/* Events table */}
      <div className="dash-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--dash-border)", fontSize: "0.9rem", fontWeight: 700, color: "var(--dash-text)" }}>
          Aktivitas Terbaru
        </div>
        <div style={{ overflowX: "auto" }} className="dash-scroll">
          <table className="dash-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--dash-text-muted)" }}>
                <th style={{ padding: "10px 14px" }}>Waktu</th>
                <th style={{ padding: "10px 14px" }}>Jenis</th>
                <th style={{ padding: "10px 14px" }}>IP</th>
                <th style={{ padding: "10px 14px" }}>Lokasi</th>
                <th style={{ padding: "10px 14px" }}>Path</th>
                <th style={{ padding: "10px 14px" }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--dash-text-muted)" }}>Memuat…</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--dash-text-muted)" }}>Belum ada aktivitas mencurigakan. 🎉</td></tr>
              ) : events.map((e) => {
                const m = metaFor(e.type);
                const loc = [e.city, e.region, e.country].filter(Boolean).join(", ") || "-";
                return (
                  <tr key={e.id} style={{ borderTop: "1px solid var(--dash-border)" }}>
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap", color: "var(--dash-text-muted)" }} title={new Date(e.createdAt).toLocaleString("id-ID")}>{timeAgo(e.createdAt)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, color: m.color, background: m.bg, whiteSpace: "nowrap" }}>{m.label}</span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-geist-mono, monospace)", color: "var(--dash-text-soft)" }}>{e.ip ?? "-"}</td>
                    <td style={{ padding: "10px 14px", color: "var(--dash-text-soft)" }}>{loc}</td>
                    <td style={{ padding: "10px 14px", color: "var(--dash-text-soft)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.path ?? ""}>{e.path ?? "-"}</td>
                    <td style={{ padding: "10px 14px", color: "var(--dash-text-muted)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.detail ?? ""}>{e.detail ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .atk-alarm { animation: atkFlash 1s ease-in-out infinite; }
        @keyframes atkFlash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
          50% { box-shadow: 0 0 22px 0 rgba(239,68,68,0.5); }
        }
      `}</style>
    </div>
  );
}
