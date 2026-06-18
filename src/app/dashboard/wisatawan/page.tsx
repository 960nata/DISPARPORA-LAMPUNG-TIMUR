"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Pencil, Trash2, Check, X, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import dynamic from "next/dynamic";

const DashboardChart = dynamic(() => import("@/components/DashboardChart"), { ssr: false });

interface VisitorStat { id: string; year: number; count: number; }

export default function WisatawanPage() {
  const { user } = useAdmin();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fg = isDark ? "rgba(255,255,255,0.5)" : "rgba(55,53,47,0.5)";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(55,53,47,0.06)";
  const ttTheme: "dark" | "light" = isDark ? "dark" : "light";

  const [stats, setStats] = useState<VisitorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editYear, setEditYear] = useState("");
  const [editCount, setEditCount] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newCount, setNewCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const sorted = [...stats].sort((a, b) => a.year - b.year);
  const chartLabels = sorted.map(s => String(s.year));
  const chartData = sorted.map(s => s.count);
  const tableRows = [...stats].sort((a, b) => b.year - a.year);

  function growth(s: VisitorStat) {
    const prev = sorted.find(x => x.year === s.year - 1);
    if (!prev || prev.count === 0) return null;
    return ((s.count - prev.count) / prev.count) * 100;
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/visitor-stats");
    const data = await res.json();
    setStats(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function startEdit(s: VisitorStat) {
    setEditId(s.id); setEditYear(String(s.year)); setEditCount(String(s.count)); setMsg(null);
  }

  async function saveEdit(id: string) {
    const year = parseInt(editYear), count = parseInt(editCount);
    if (isNaN(year) || isNaN(count) || count < 0) { setMsg({ ok: false, text: "Data tidak valid." }); return; }
    setSaving(true);
    await fetch(`/api/visitor-stats/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, count }),
    });
    setEditId(null); setMsg({ ok: true, text: "Tersimpan." });
    await load(); setSaving(false);
  }

  async function del(id: string, year: number) {
    if (!confirm(`Hapus data tahun ${year}?`)) return;
    await fetch(`/api/visitor-stats/${id}`, { method: "DELETE" });
    setMsg({ ok: true, text: `Data ${year} dihapus.` }); await load();
  }

  async function add() {
    const year = parseInt(newYear), count = parseInt(newCount);
    if (isNaN(year) || isNaN(count) || count < 0) { setMsg({ ok: false, text: "Isi tahun dan jumlah dengan benar." }); return; }
    if (stats.find(s => s.year === year)) { setMsg({ ok: false, text: `Tahun ${year} sudah ada.` }); return; }
    setSaving(true);
    await fetch("/api/visitor-stats", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, count }),
    });
    setNewYear(""); setNewCount(""); setMsg({ ok: true, text: `Tahun ${year} ditambahkan.` });
    await load(); setSaving(false);
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)" }}>Pertumbuhan Wisatawan</h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dash-text-muted)" }}>Data kunjungan wisatawan per tahun</p>
      </div>

      {msg && (
        <div style={{ padding: "9px 14px", borderRadius: "9px", fontSize: "0.83rem", fontWeight: 600, background: msg.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: msg.ok ? "var(--dash-success)" : "var(--dash-danger)", border: `1px solid ${msg.ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}` }}>
          {msg.text}
        </div>
      )}

      {/* Chart */}
      {sorted.length > 0 && (
        <div className="dash-card" style={{ padding: "22px" }}>
          <p style={{ margin: "0 0 16px", fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Grafik Kunjungan Wisatawan</p>
          <DashboardChart
            type="bar"
            options={{
              chart: { foreColor: fg, toolbar: { show: false } },
              colors: ["#6366f1"],
              plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
              dataLabels: { enabled: false },
              grid: { borderColor: gridColor, strokeDashArray: 4 },
              xaxis: {
                categories: chartLabels,
                axisBorder: { show: false }, axisTicks: { show: false },
                labels: { style: { fontSize: "12px", fontWeight: 600 } },
              },
              yaxis: { labels: { formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v) } },
              tooltip: { theme: ttTheme, y: { formatter: (v: number) => v.toLocaleString("id-ID") + " wisatawan" } },
              legend: { show: false },
            }}
            series={[{ name: "Wisatawan", data: chartData }]}
            height={260}
          />
        </div>
      )}

      {/* Tambah */}
      <div className="dash-card" style={{ padding: "16px", display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 120px" }}>
          <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 600, color: "var(--dash-text-muted)", marginBottom: "5px" }}>Tahun</label>
          <input className="dash-input" type="number" placeholder="2027" value={newYear} onChange={e => setNewYear(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 600, color: "var(--dash-text-muted)", marginBottom: "5px" }}>Jumlah Wisatawan</label>
          <input className="dash-input" type="number" placeholder="0" value={newCount} onChange={e => setNewCount(e.target.value)} style={{ width: "100%" }} />
        </div>
        <button onClick={add} disabled={saving || !newYear || !newCount} className="dash-btn"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", fontSize: "0.85rem", flexShrink: 0 }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Tabel */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--dash-text-muted)", fontSize: "0.85rem" }}>Memuat...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.73rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tahun</th>
                <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "0.73rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Jumlah Wisatawan</th>
                <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "0.73rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pertumbuhan</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.73rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((s, i) => {
                const pct = growth(s);
                const up = pct !== null && pct > 0;
                const down = pct !== null && pct < 0;
                return (
                  <tr key={s.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--dash-border)" }}>
                    <td style={{ padding: "13px 20px" }}>
                      {editId === s.id
                        ? <input className="dash-input" type="number" value={editYear} onChange={e => setEditYear(e.target.value)} style={{ width: "90px", padding: "6px 10px", fontSize: "0.9rem", fontWeight: 700 }} />
                        : <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dash-text)" }}>{s.year}</span>}
                    </td>
                    <td style={{ padding: "13px 20px", textAlign: "right" }}>
                      {editId === s.id
                        ? <input className="dash-input" type="number" value={editCount} onChange={e => setEditCount(e.target.value)} style={{ width: "140px", padding: "6px 10px", fontSize: "0.9rem", fontWeight: 700, textAlign: "right" }} />
                        : <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dash-text)" }}>{s.count.toLocaleString("id-ID")}</span>}
                    </td>
                    <td style={{ padding: "13px 20px", textAlign: "center" }}>
                      {pct === null ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--dash-text-muted)" }}>
                          <Minus size={12} /> —
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: up ? "rgba(16,185,129,0.12)" : down ? "rgba(239,68,68,0.1)" : "transparent", color: up ? "var(--dash-success)" : down ? "var(--dash-danger)" : "var(--dash-text-muted)" }}>
                          {up ? <TrendingUp size={13} /> : down ? <TrendingDown size={13} /> : <Minus size={13} />}
                          {up ? "+" : ""}{pct.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "center" }}>
                      {editId === s.id ? (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button onClick={() => saveEdit(s.id)} disabled={saving} style={{ padding: "6px 8px", borderRadius: "8px", border: "none", background: "var(--dash-success)", color: "#fff", cursor: "pointer", display: "flex" }}><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", display: "flex" }}><X size={14} /></button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button onClick={() => startEdit(s)} style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", display: "flex" }}><Pencil size={14} /></button>
                          <button onClick={() => del(s.id, s.year)} style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-danger)", cursor: "pointer", display: "flex" }}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
