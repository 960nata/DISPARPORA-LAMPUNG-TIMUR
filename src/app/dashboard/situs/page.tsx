"use client";

import { useEffect, useState } from "react";
import { Power, ShieldAlert, Save, Globe, CalendarDays } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface SiteStatus {
  suspended: boolean;
  message: string;
  dueDate: string | null;
}

export default function StatusSitusPage() {
  const { user } = useAdmin();
  const [status, setStatus] = useState<SiteStatus>({ suspended: false, message: "", dueDate: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/site-status")
      .then((r) => r.json())
      .then((d) => setStatus({ suspended: !!d.suspended, message: d.message ?? "", dueDate: d.dueDate ?? null }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (user && user.role !== "superadmin") {
    return (
      <div className="dash-card" style={{ padding: "32px", textAlign: "center", maxWidth: "520px", margin: "40px auto" }}>
        <ShieldAlert size={40} style={{ color: "var(--dash-danger)", margin: "0 auto 14px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)" }}>Akses Ditolak</h2>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.9rem" }}>
          Hanya Super Admin yang dapat mengatur status situs.
        </p>
      </div>
    );
  }

  async function save(next: SiteStatus) {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/site-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setStatus({ suspended: !!data.suspended, message: data.message ?? "", dueDate: data.dueDate ?? null });
      setFeedback({ type: "ok", text: "Status situs berhasil diperbarui." });
    } catch (e: any) {
      setFeedback({ type: "err", text: e.message || "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  }

  const toggleSuspend = () => save({ ...status, suspended: !status.suspended });

  if (loading) {
    return <div style={{ padding: "40px", color: "var(--dash-text-muted)" }}>Memuat status situs…</div>;
  }

  const isSuspended = status.suspended;

  return (
    <div style={{ maxWidth: "760px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--dash-text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Status Situs
        </h1>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Nonaktifkan situs publik untuk pemeliharaan. Saat nonaktif, pengunjung melihat halaman pemeliharaan,
          namun Anda tetap bisa masuk dan mengelola lewat login Super Admin seperti biasa.
        </p>
      </div>

      {/* Status + toggle card */}
      <div className="dash-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isSuspended ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
              border: `1px solid ${isSuspended ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
            }}
          >
            <Globe size={24} style={{ color: isSuspended ? "var(--dash-danger)" : "var(--dash-success)" }} />
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--dash-text-muted)" }}>
              STATUS SAAT INI
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: isSuspended ? "var(--dash-danger)" : "var(--dash-success)" }}>
              {isSuspended ? "Nonaktif (Pemeliharaan)" : "Aktif — Situs Publik Online"}
            </div>
          </div>
          <button
            onClick={toggleSuspend}
            disabled={saving}
            className="dash-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "0.88rem",
              background: isSuspended
                ? "linear-gradient(135deg, var(--dash-success), #059669)"
                : "linear-gradient(135deg, var(--dash-danger), #b91c1c)",
              opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <Power size={17} />
            {isSuspended ? "Aktifkan Situs" : "Nonaktifkan Situs"}
          </button>
        </div>
      </div>

      {/* Settings card */}
      <div className="dash-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "7px", letterSpacing: "0.02em" }}>
            PESAN HALAMAN PEMELIHARAAN
          </label>
          <textarea
            className="dash-input"
            value={status.message}
            onChange={(e) => setStatus((s) => ({ ...s, message: e.target.value }))}
            placeholder="Situs sedang tidak aktif sementara untuk pemeliharaan terjadwal. Silakan kembali beberapa saat lagi."
            rows={3}
            maxLength={500}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: "0.9rem", lineHeight: 1.6 }}
          />
          <div style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", marginTop: "5px" }}>
            Kosongkan untuk memakai pesan bawaan. Maks. 500 karakter.
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "7px", letterSpacing: "0.02em" }}>
            <CalendarDays size={14} /> JATUH TEMPO PEMELIHARAAN TAHUNAN
          </label>
          <input
            type="date"
            className="dash-input"
            value={status.dueDate ?? ""}
            onChange={(e) => setStatus((s) => ({ ...s, dueDate: e.target.value || null }))}
            style={{ fontSize: "0.9rem", maxWidth: "220px" }}
          />
          <div style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", marginTop: "5px" }}>
            Pengingat internal untuk Anda — tidak ditampilkan ke publik.
          </div>
        </div>

        {feedback && (
          <div
            style={{
              padding: "10px 14px", borderRadius: "10px", fontSize: "0.82rem", fontWeight: 600,
              background: feedback.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${feedback.type === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
              color: feedback.type === "ok" ? "var(--dash-success)" : "var(--dash-danger)",
            }}
          >
            {feedback.text}
          </div>
        )}

        <div>
          <button
            onClick={() => save(status)}
            disabled={saving}
            className="dash-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "0.88rem", opacity: saving ? 0.6 : 1 }}
          >
            <Save size={16} />
            {saving ? "Menyimpan…" : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}
