"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Eye, MousePointerClick, UserPlus, Repeat, Download, MapPin, TrendingUp, Map as MapIcon,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/contexts/ThemeContext";
import { StatCardSkeleton } from "@/components/Skeleton";
import DashboardChart from "@/components/DashboardChart";

const VisitorMap = dynamic(() => import("@/components/VisitorMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-muted)", fontSize: "0.8rem" }}>
      Memuat peta…
    </div>
  ),
});

interface Totals { views: number; sessions: number; newVisits: number; returningVisits: number; avgPerSession: number; }
interface Series { labels: string[]; data: number[]; }
interface Popular { path: string; label: string; views: number; }
interface VisitorLocation { name: string; views: number; }
interface MapPoint { name: string; views: number; lat: number | null; lng: number | null; }
interface Analytics { totals: Totals; series: Series; popular: Popular[]; locations: VisitorLocation[]; originPoints: MapPoint[]; kecamatanViews: MapPoint[]; }

const RANGES = [
  { id: "hari-ini", label: "Hari Ini" },
  { id: "minggu", label: "Minggu Ini" },
  { id: "bulan", label: "Bulan Ini" },
  { id: "3bulan", label: "3 Bulan" },
  { id: "6bulan", label: "6 Bulan" },
  { id: "9bulan", label: "9 Bulan" },
  { id: "tahun", label: "1 Tahun" },
] as const;

const EMPTY: Analytics = {
  totals: { views: 0, sessions: 0, newVisits: 0, returningVisits: 0, avgPerSession: 0 },
  series: { labels: [], data: [] },
  popular: [],
  locations: [],
  originPoints: [],
  kecamatanViews: [],
};

export default function DashboardPage() {
  const { user } = useAdmin();
  const { theme } = useTheme();
  const [range, setRange] = useState<string>("bulan");
  const [data, setData] = useState<Analytics>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { if (alive && !d.error) setData({ ...EMPTY, ...d }); })
      .catch(console.error)
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [range]);

  const rangeLabel = RANGES.find(r => r.id === range)?.label ?? "";

  const isDark = theme === "dark";
  const fg = isDark ? "rgba(255,255,255,0.5)" : "rgba(55,53,47,0.5)";
  const grid = isDark ? "rgba(255,255,255,0.06)" : "rgba(55,53,47,0.06)";
  const ttTheme: "dark" | "light" = isDark ? "dark" : "light";
  const textMain = isDark ? "rgba(255,255,255,0.9)" : "#37352f";

  const ACCENT = "var(--dash-primary)";
  const C2 = "var(--dash-success)";
  const C3 = "var(--dash-warning)";
  const C4 = "var(--dash-pink)";
  const CARD: React.CSSProperties = { background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "18px", padding: "22px" };

  const { totals, series, popular, locations, originPoints, kecamatanViews } = data;

  // "Kunjungan" = accumulated page views across all pages (page-based, not per-user).
  const stats = [
    { label: "Total Kunjungan", value: totals.views, hint: "akumulasi page views", icon: Eye, accent: ACCENT, soft: "var(--dash-primary-bg)" },
    { label: "Sesi", value: totals.sessions, hint: `${totals.avgPerSession} halaman/sesi`, icon: MousePointerClick, accent: C2, soft: "var(--dash-success-bg)" },
    { label: "Pengunjung Baru", value: totals.newVisits, hint: "kunjungan pertama", icon: UserPlus, accent: C3, soft: "var(--dash-warning-bg)" },
    { label: "Pengunjung Kembali", value: totals.returningVisits, hint: "kunjungan ulang", icon: Repeat, accent: C4, soft: "var(--dash-pink-bg)" },
  ];

  const sparkOpts = (color: string) => ({
    chart: { sparkline: { enabled: true }, foreColor: fg },
    colors: [color], stroke: { curve: "smooth" as const, width: 2.4 },
    fill: { type: "solid", opacity: 0 },
    tooltip: { enabled: false }, dataLabels: { enabled: false },
  });

  const trafficOpts = useMemo(() => ({
    chart: { foreColor: fg, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [ACCENT],
    stroke: { curve: "smooth" as const, width: 2.6 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    grid: { borderColor: grid, strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: series.labels,
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { rotate: 0, style: { fontSize: "11px" }, hideOverlappingLabels: true },
      tickAmount: Math.min(series.labels.length, 12),
    },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },
    tooltip: { theme: ttTheme },
    legend: { show: false },
  }), [fg, grid, ttTheme, series.labels]);

  const trafficSeries = [{ name: "Kunjungan", data: series.data }];

  const newReturnOpts = useMemo(() => ({
    labels: ["Baru", "Kembali"],
    colors: [ACCENT, "var(--dash-text-muted)"],
    chart: { foreColor: fg },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: ttTheme },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "72%", labels: { show: true, name: { fontSize: "11px", color: fg }, value: { fontSize: "20px", fontWeight: 800, color: textMain }, total: { show: true, label: "Total", color: fg, formatter: () => String(totals.newVisits + totals.returningVisits) } } } } },
  }), [fg, ttTheme, textMain, totals.newVisits, totals.returningVisits]);

  const maxViews = popular[0]?.views || 1;
  const maxLoc = locations[0]?.views || 1;
  const maxKec = kecamatanViews[0]?.views || 1;

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ["Metrik", "Nilai"],
      ["Periode", rangeLabel],
      ["Total Page Views", totals.views],
      ["Sesi", totals.sessions],
      ["Halaman per Sesi", totals.avgPerSession],
      ["Pengunjung Baru", totals.newVisits],
      ["Pengunjung Kembali", totals.returningVisits],
      [],
      ["Halaman", "URL", "Views"],
      ...popular.map(p => [p.label, p.path, p.views]),
      [],
      ["Lokasi", "Views"],
      ...locations.map(l => [l.name, l.views]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traffic-disparpora-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasTraffic = totals.views > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontFamily: "var(--font-main)" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--dash-text)" }}>Traffic Kunjungan</h1>
          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--dash-text-soft)" }}>
            Selamat datang, {user?.name || "Admin"} — statistik kunjungan halaman DISPARPORA Lampung Timur.
          </p>
        </div>
        <button onClick={handleExport} className="dash-btn" style={{ padding: "10px 16px", fontSize: "0.82rem", borderRadius: "11px", boxShadow: "0 10px 22px -12px var(--dash-primary)" }}>
          <Download size={15} /> Ekspor CSV
        </button>
      </div>

      {/* ── Period TABS ── */}
      <div className="dash-scroll" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
        {RANGES.map(r => {
          const active = r.id === range;
          return (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              style={{
                flexShrink: 0, padding: "9px 16px", borderRadius: "11px", cursor: "pointer",
                fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 700,
                border: active ? "1px solid transparent" : "1px solid var(--dash-border)",
                background: active ? "var(--dash-primary)" : "var(--dash-card)",
                color: active ? "#fff" : "var(--dash-text-soft)",
                boxShadow: active ? "0 10px 22px -14px var(--dash-primary)" : "none",
                transition: "all .15s ease",
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── KPI ROW ── */}
      {loading ? (
        <div className="dash-grid-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : (
        <div className="dash-grid-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
          {stats.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ ...CARD, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: card.soft, color: card.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={21} />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", padding: "5px 9px", borderRadius: "20px" }}>
                    {rangeLabel}
                  </span>
                </div>
                <div style={{ marginTop: "16px", fontSize: "1.95rem", fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: "var(--dash-text)" }}>{card.value.toLocaleString("id-ID")}</div>
                <div style={{ marginTop: "2px", fontSize: "0.84rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>{card.label}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>{card.hint}</div>
                <div style={{ height: "34px", marginTop: "10px" }}>
                  <DashboardChart type="line" options={sparkOpts(card.accent)} series={[{ data: series.data.length ? series.data : [0, 0] }]} height={34} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TRAFFIC CHART (full width) ── */}
      <div style={{ ...CARD, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Grafik Kunjungan Halaman</div>
            <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>
              Total <strong style={{ color: "var(--dash-text)" }}>{totals.views.toLocaleString("id-ID")}</strong> page views — periode {rangeLabel}
            </div>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-primary)", background: "var(--dash-primary-bg)", padding: "6px 12px", borderRadius: "20px" }}>
            <TrendingUp size={13} /> LIVE
          </span>
        </div>
        <div style={{ marginTop: "14px", height: "280px" }}>
          <DashboardChart type="area" options={trafficOpts} series={trafficSeries} height="100%" />
        </div>
      </div>

      {/* ── ROW: NEW vs RETURNING + LOKASI ── */}
      <div className="grid-charts" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)", gap: "18px" }}>
        {/* New vs Returning */}
        <div style={{ ...CARD }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Pengunjung Baru vs Kembali</div>
          <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Berdasarkan perangkat anonim</div>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", marginTop: "14px" }}>
            <div style={{ width: "128px", height: "128px", flexShrink: 0 }}>
              <DashboardChart type="donut" options={newReturnOpts} series={[totals.newVisits, totals.returningVisits]} height={128} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: ACCENT }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Baru</span>
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--dash-text)", marginLeft: "16px", fontVariantNumeric: "tabular-nums" }}>{totals.newVisits.toLocaleString("id-ID")}</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: "var(--dash-text-muted)" }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Kembali</span>
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--dash-text)", marginLeft: "16px", fontVariantNumeric: "tabular-nums" }}>{totals.returningVisits.toLocaleString("id-ID")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Asal Pengunjung (geo-IP, level provinsi/kota) */}
        <div style={{ ...CARD }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} style={{ color: "var(--dash-primary)" }} />
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Asal Pengunjung</div>
              </div>
              <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Perkiraan wilayah dari geo-IP (level provinsi/kota, tanpa alamat IP)</div>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-primary)", background: "var(--dash-primary-bg)", padding: "5px 11px", borderRadius: "20px" }}>{locations.length} wilayah</span>
          </div>
          {locations.length === 0 ? (
            <div style={{ padding: "34px 0", textAlign: "center", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>Belum ada data lokasi kunjungan.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginTop: "18px" }}>
              {locations.slice(0, 5).map(l => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dash-text-soft)", width: "150px", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={l.name}>{l.name}</span>
                  <div style={{ flex: 1, height: "8px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round(l.views / maxLoc * 100)}%`, height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text)", width: "44px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.views}</span>
                </div>
              ))}
              {locations.length > 5 && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  style={{
                    alignSelf: "flex-start",
                    background: "none",
                    border: "none",
                    color: "var(--dash-primary)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 0",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                  }}
                  className="dash-link-btn"
                >
                  Lainnya ({locations.length - 5} wilayah) →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── PETA KUNJUNGAN PER KECAMATAN (Lampung Timur) ── */}
      <div style={{ ...CARD }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapIcon size={16} style={{ color: "var(--dash-primary)" }} />
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Peta Kunjungan per Kecamatan</div>
            </div>
            <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Akumulasi page views destinasi wisata per kecamatan Lampung Timur</div>
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-primary)", background: "var(--dash-primary-bg)", padding: "5px 11px", borderRadius: "20px" }}>{kecamatanViews.length} kecamatan</span>
        </div>
        <div className="grid-charts" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: "18px", marginTop: "16px" }}>
          <div style={{ height: "320px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
            <VisitorMap points={kecamatanViews} center={[-5.05, 105.65]} zoom={9} valueLabel="Views destinasi" />
          </div>
          <div>
            {kecamatanViews.length === 0 ? (
              <div style={{ padding: "34px 0", textAlign: "center", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
                Belum ada kunjungan halaman destinasi. Data terisi saat pengunjung membuka halaman destinasi.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {kecamatanViews.slice(0, 10).map(k => (
                  <div key={k.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dash-text-soft)", width: "130px", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</span>
                    <div style={{ flex: 1, height: "8px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                      <div style={{ width: `${Math.round(k.views / maxKec * 100)}%`, height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text)", width: "44px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{k.views}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PETA ASAL PENGUNJUNG (geo-IP) ── */}
      <div style={{ ...CARD }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapIcon size={16} style={{ color: "var(--dash-primary)" }} />
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Peta Asal Pengunjung</div>
            </div>
            <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Lokasi pengunjung dari geo-IP (level kota/provinsi — bukan alamat IP)</div>
          </div>
        </div>
        <div style={{ height: "320px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--dash-border)", marginTop: "16px" }}>
          <VisitorMap points={originPoints} center={[-2.0, 118.0]} zoom={4} valueLabel="Kunjungan" />
        </div>
      </div>

      {/* ── POPULAR CONTENT ── */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Halaman Populer</div>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--dash-warning)", background: "var(--dash-warning-bg)", padding: "3px 9px", borderRadius: "20px" }}>PERIODE {rangeLabel.toUpperCase()}</span>
            </div>
            <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Halaman dengan page views terbanyak</div>
          </div>
        </div>

        {popular.length === 0 ? (
          <div style={{ padding: "34px 0", textAlign: "center", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
            Belum ada kunjungan pada periode ini. Data akan muncul otomatis saat halaman situs dibuka pengunjung.
          </div>
        ) : (
          <>
            <div className="dash-pop-row" style={{ display: "grid", gridTemplateColumns: "34px 1fr 130px 64px", gap: "14px", padding: "14px 4px 12px", borderBottom: "1px solid var(--dash-border)", marginTop: "14px", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--dash-text-muted)" }}>
              <span>#</span><span>HALAMAN</span><span className="dash-hide-sm">DISTRIBUSI</span><span style={{ textAlign: "right" }}>VIEWS</span>
            </div>
            {popular.map((p, i) => (
              <div key={p.path} className="dash-pop-row" style={{ display: "grid", gridTemplateColumns: "34px 1fr 130px 64px", gap: "14px", alignItems: "center", padding: "13px 4px", borderBottom: i === popular.length - 1 ? "none" : "1px solid var(--dash-border)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--dash-text-muted)", fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--dash-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.path}</div>
                </div>
                <div className="dash-hide-sm" style={{ height: "8px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(p.views / maxViews * 100)}%`, height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--dash-text)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.views}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "8px 0 4px", fontSize: "0.74rem", color: "var(--dash-text-muted)" }}>
        © {new Date().getFullYear()} DISPARPORA Lampung Timur · Statistik kunjungan {hasTraffic ? "real-time" : "menunggu data"}
      </div>

      {/* Drawer / Side Sheet for All Locations */}
      <div
        className={`dash-drawer-overlay ${isDrawerOpen ? "open" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className="dash-drawer-content"
          style={{ padding: "24px", display: "flex", flexDirection: "column", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--dash-border)", paddingBottom: "16px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)" }}>Semua Asal Pengunjung</h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Daftar lengkap wilayah berdasarkan Kunjungan</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: "var(--dash-surface-hover)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--dash-text)",
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {locations.map((l: VisitorLocation, index: number) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", width: "24px", fontVariantNumeric: "tabular-nums" }}>
                  #{index + 1}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dash-text-soft)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={l.name}>
                  {l.name}
                </span>
                <div style={{ width: "120px", height: "8px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(l.views / maxLoc * 100)}%`, height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text)", width: "44px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {l.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style jsx global>{`
        @media (max-width: 1100px) {
          .dash-grid-kpi { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .grid-charts { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .dash-grid-kpi { grid-template-columns: 1fr !important; }
          .dash-pop-row { grid-template-columns: 28px 1fr 56px !important; }
          .dash-pop-row .dash-hide-sm { display: none !important; }
        }

        /* Drawer Overlay */
        .dash-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s ease;
        }
        .dash-drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        /* Drawer Content */
        .dash-drawer-content {
          width: 100%;
          max-width: 450px;
          height: 100%;
          background: var(--dash-card);
          border-left: 1px solid var(--dash-border);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-drawer-overlay.open .dash-drawer-content {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
