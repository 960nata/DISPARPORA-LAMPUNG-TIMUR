"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Users, UserCheck, MapPin, FileText, Download, Calendar,
  ChevronDown, Clock, Minus, Heart
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/contexts/ThemeContext";
import { StatCardSkeleton } from "@/components/Skeleton";
import DashboardChart from "@/components/DashboardChart";

interface TourismItem { id: string; category: string; active: boolean; kecamatan: string; }
interface NewsPost { id: string; title: string; status: string; createdAt: string; authorName: string; }
interface VisitorStat { id: string; year: number; month: number; count: number; }

const VisitorMap = dynamic(() => import("@/components/VisitorMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-text-muted)", fontSize: "0.8rem" }}>
      Memuat peta...
    </div>
  )
});

export default function DashboardPage() {
  const { user } = useAdmin();
  const { theme } = useTheme();
  const [destinations, setDestinations] = useState<TourismItem[]>([]);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStat[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"1 Hari" | "1 Minggu" | "1 Bulan" | "1 Tahun">("1 Bulan");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/destinations").then(r => r.json()),
      fetch("/api/posts").then(r => r.json()),
      fetch("/api/visitor-stats").then(r => r.json()),
      fetch("/api/destinations/likes").then(r => r.json()).catch(() => ({ total: 0 })),
    ]).then(([dest, news, vstats, likes]) => {
      if (Array.isArray(dest)) setDestinations(dest);
      if (Array.isArray(news)) setPosts(news);
      if (Array.isArray(vstats)) setVisitorStats(vstats);
      if (likes?.total !== undefined) setTotalLikes(likes.total);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeCount = destinations.filter(d => d.active).length;
  const publishedCount = posts.filter(p => p.status === "published").length;

  const isDark = theme === "dark";
  const fg = isDark ? "rgba(255,255,255,0.5)" : "rgba(55,53,47,0.5)";
  const grid = isDark ? "rgba(255,255,255,0.06)" : "rgba(55,53,47,0.06)";
  const ttTheme: "dark" | "light" = isDark ? "dark" : "light";
  const textMain = isDark ? "rgba(255,255,255,0.9)" : "#37352f";

  const ACCENT = "var(--dash-primary)";   // emerald
  const C2 = "var(--dash-success)";        // sky/blue
  const C3 = "var(--dash-warning)";        // amber
  const C4 = "var(--dash-pink)";           // pink
  const CARD: React.CSSProperties = { background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "18px", padding: "22px" };

  // ── Mock GA4 traffic (30 hari) ──
  const traffic30 = [12,18,15,22,28,24,31,27,35,30,38,42,36,44,40,48,45,52,49,55,58,53,61,57,64,60,68,72,66,74];
  const dateLabels = ["17 Mei","","","","22 Mei","","","","27 Mei","","","","1 Jun","","","","6 Jun","","","","11 Jun","","","","16 Jun","","","","",""];
  const trafficDaily = [18,20,19,22,24,26,29,32,35,38,40,42,41,43,45,47,49,50,52,51,49,46,44,42];
  const dailyLabels = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
  const trafficWeekly = [310,330,320,340,360,380,390];
  const weekLabels = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
  const trafficMonthly = [310,420,380,510,490,620,590,710,680,790,750,873];
  const monthLabels = ["Jul","Ags","Sep","Okt","Nov","Des","Jan","Feb","Mar","Apr","Mei","Jun"];
  const sortedStats = [...visitorStats].sort((a, b) => a.year - b.year);
  const trafficYearly = sortedStats.length > 0 ? sortedStats.map(s => s.count) : [142800,198500,254200,353200,218100];
  const yearLabels = sortedStats.length > 0 ? sortedStats.map(s => String(s.year)) : ["2022","2023","2024","2025","2026"];
  const latestStat = sortedStats[sortedStats.length - 1];
  const trafficConfig = useMemo(() => {
    switch (period) {
      case "1 Hari": return { labels: dailyLabels, data: trafficDaily };
      case "1 Minggu": return { labels: weekLabels, data: trafficWeekly };
      case "1 Bulan": return { labels: monthLabels, data: trafficMonthly };
      case "1 Tahun": return { labels: yearLabels.length > 0 ? yearLabels : monthLabels, data: trafficYearly.length > 0 ? trafficYearly : trafficMonthly };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, visitorStats]);

  const visitorDisplay = latestStat ? latestStat.count.toLocaleString("id-ID") : "—";
  const visitorYear = latestStat ? String(latestStat.year) : "";

  // ── KPI Cards ──
  const stats = [
    { label: "Total Wisatawan", value: visitorDisplay, delta: visitorYear, up: null, icon: Users, accent: ACCENT, soft: "var(--dash-primary-bg)", spark: trafficYearly.slice(-10) },
    { label: "Likes Destinasi",  value: String(totalLikes), delta: "total", up: null, icon: Heart, accent: "#ef4444", soft: "rgba(239,68,68,0.08)", spark: [0,1,2,1,3,4,3,5,6,totalLikes] },
    { label: "Destinasi Aktif",  value: String(activeCount || 12), delta: "0 baru", up: null, icon: MapPin, accent: C3, soft: "var(--dash-warning-bg)", spark: [4,5,5,6,6,7,8,9,10,12] },
    { label: "Berita Terpublikasi", value: String(publishedCount || 43), delta: "0 baru", up: null, icon: FileText, accent: C4, soft: "var(--dash-pink-bg)", spark: [10,12,14,13,18,20,22,28,34,43] },
  ];

  const sparkOpts = (color: string) => ({
    chart: { sparkline: { enabled: true }, foreColor: fg },
    colors: [color], stroke: { curve: "smooth" as const, width: 2.4 },
    fill: { type: "solid", opacity: 0 },
    tooltip: { enabled: false }, dataLabels: { enabled: false }
  });

  // ── Traffic area chart ──
  const trafficOpts = useMemo(() => ({
    chart: { foreColor: fg, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [ACCENT],
    stroke: { curve: "smooth" as const, width: 2.6 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    grid: { borderColor: grid, strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: trafficConfig.labels,
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { rotate: 0, style: { fontSize: "11px" } }, tickAmount: 7
    },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },
    tooltip: { theme: ttTheme },
    legend: { show: false }
  }), [fg, grid, ttTheme, trafficConfig]);

  const trafficSeries = [{
    name: "Kunjungan",
    data: trafficConfig.data
  }];

  // ── Device donut ──
  const deviceOpts = useMemo(() => ({
    labels: ["Desktop", "Mobile", "Tablet"],
    colors: [ACCENT, C2, "var(--dash-text-muted)"],
    chart: { foreColor: fg },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: ttTheme },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "72%", labels: { show: true, name: { fontSize: "11px", color: fg }, value: { fontSize: "20px", fontWeight: 800, color: textMain }, total: { show: true, label: "Pengunjung", color: fg, formatter: () => "873" } } } } }
  }), [fg, ttTheme, textMain]);

  // ── New vs Returning donut ──
  const newReturnOpts = useMemo(() => ({
    labels: ["Baru", "Kembali"],
    colors: [ACCENT, "var(--dash-text-muted)"],
    chart: { foreColor: fg },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: ttTheme },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, name: { fontSize: "10px", color: fg }, value: { fontSize: "15px", fontWeight: 800, color: textMain }, total: { show: true, label: "Total", fontSize: "10px", color: fg, formatter: () => "148" } } } } }
  }), [fg, ttTheme, textMain]);

  // ── Sources & Countries (bar lists) ──
  const sources = [
    { name: "Direct / Langsung", pct: 42, color: ACCENT },
    { name: "Organic Search",    pct: 31, color: C2 },
    { name: "Media Sosial",      pct: 18, color: C3 },
    { name: "Referral",          pct: 9,  color: C4 },
  ];
  const countries = [
    { name: "Indonesia",       pct: 78 },
    { name: "Singapura",       pct: 9 },
    { name: "Malaysia",        pct: 6 },
    { name: "Amerika Serikat", pct: 4 },
    { name: "Lainnya",         pct: 3 },
  ];

  // ── Popular content ──
  const popular = [
    { label: "Beranda", path: "/", views: 306 },
    { label: "Direktori Wisata", path: "/direktori", views: 52 },
    { label: "Profil Dinas", path: "/profil", views: 48 },
    { label: "Peta Wisata Interaktif", path: "/peta", views: 45 },
    { label: "Berita & Artikel", path: "/berita", views: 40 },
    { label: "Bidang Dinas", path: "/bidang", views: 26 },
    { label: "Detail Destinasi", path: "/direktori/danau-way-jepara", views: 22 },
    { label: "Detail Berita", path: "/berita/festival-way-kambas-2025", views: 20 },
    { label: "Kontak", path: "/kontak", views: 17 },
    { label: "Akses Admin", path: "/admin", views: 16 },
  ];
  const maxViews = popular[0].views;

  const handleExport = () => {
    const rows = [
      ["Metrik", "Nilai"],
      ["Total Pengunjung", "873"],
      ["Pengunjung Unik", "125"],
      ["Destinasi Aktif", String(activeCount || 12)],
      ["Berita Terpublikasi", String(publishedCount || 43)],
      [],
      ["Halaman", "URL", "Views"],
      ...popular.map(p => [p.label, p.path, String(p.views)]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-disparpora-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", fontFamily: "var(--font-main)" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--dash-text)" }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--dash-text-soft)" }}>
            Selamat datang kembali, {user?.name || "Admin"} — ringkasan aktivitas DISPARPORA Lampung Timur.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} ref={periodRef}>
          <button onClick={() => setPeriodOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px", borderRadius: "11px", border: "1px solid var(--dash-border)", background: "var(--dash-card)", color: "var(--dash-text-soft)", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", position: "relative" }}>
            <Calendar size={16} /> {period} <ChevronDown size={14} />
          </button>
          {periodOpen && (
            <div style={{ position: "absolute", top: "54px", left: 0, minWidth: "200px", borderRadius: "16px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", boxShadow: "0 18px 36px rgba(0,0,0,0.12)", zIndex: 10, padding: "10px 0" }}>
              {(["1 Hari", "1 Minggu", "1 Bulan", "1 Tahun"] as const).map(option => (
                <button key={option} onClick={() => { setPeriod(option); setPeriodOpen(false); }} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", border: "none", background: option === period ? "var(--dash-surface-hover)" : "transparent", color: "var(--dash-text)", cursor: "pointer", fontWeight: option === period ? 700 : 500, textAlign: "left" }}>
                  <span>{option}</span>
                  {option === period ? <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>Dipilih</span> : null}
                </button>
              ))}
            </div>
          )}
          <button onClick={handleExport} className="dash-btn" style={{ padding: "10px 16px", fontSize: "0.82rem", borderRadius: "11px", boxShadow: "0 10px 22px -12px var(--dash-primary)" }}>
            <Download size={15} /> Ekspor
          </button>
        </div>
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
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", padding: "5px 9px", borderRadius: "20px" }}>
                    <Minus size={12} /> {card.delta}
                  </span>
                </div>
                <div style={{ marginTop: "16px", fontSize: "1.95rem", fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: "var(--dash-text)" }}>{card.value}</div>
                <div style={{ marginTop: "2px", fontSize: "0.84rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>{card.label}</div>
                <div style={{ height: "34px", marginTop: "12px" }}>
                  <DashboardChart type="line" options={sparkOpts(card.accent)} series={[{ data: card.spark }]} height={34} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ROW: TRAFFIC + DEVICE ── */}
      <div className="grid-charts" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) minmax(0, 1fr)", gap: "18px" }}>
        <div style={{ ...CARD, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Trafik Pengunjung</div>
              <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Total <strong style={{ color: "var(--dash-text)" }}>873</strong> kunjungan dalam 30 hari terakhir</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--dash-text-muted)", fontSize: "0.82rem" }}>
              <span>Periode:</span>
              <strong style={{ color: "var(--dash-text)", fontWeight: 700 }}>{period}</strong>
            </div>
          </div>
          <div style={{ marginTop: "14px", height: "240px" }}>
            <DashboardChart type="area" options={trafficOpts} series={trafficSeries} height="100%" />
          </div>
        </div>

        <div style={{ ...CARD, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Device Pengunjung</div>
          <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Berdasarkan perangkat akses</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0" }}>
            <DashboardChart type="donut" options={deviceOpts} series={[506, 314, 53]} height={180} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {[
              { c: ACCENT, label: "Desktop", v: "58%" },
              { c: C2, label: "Mobile", v: "36%" },
              { c: "var(--dash-text-muted)", label: "Tablet", v: "6%" },
            ].map(d => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: d.c }} />
                <span style={{ fontSize: "0.82rem", color: "var(--dash-text-soft)", flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dash-text)" }}>{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW: MAP + SOURCES ── */}
      <div className="grid-charts" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: "18px" }}>
        <div style={{ ...CARD }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Sebaran Geografis Pengunjung</div>
              <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Negara asal kunjungan</div>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-primary)", background: "var(--dash-primary-bg)", padding: "5px 11px", borderRadius: "20px" }}>8 negara</span>
          </div>
          <div style={{ marginTop: "16px", height: "200px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
            <VisitorMap />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginTop: "18px" }}>
            {countries.map(c => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dash-text-soft)", width: "130px", flexShrink: 0 }}>{c.name}</span>
                <div style={{ flex: 1, height: "8px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text)", width: "38px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...CARD }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Sumber Traffic</div>
          <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Dari mana pengunjung datang</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "20px" }}>
            {sources.map(s => (
              <div key={s.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--dash-text)" }}>{s.name}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text-soft)", fontVariantNumeric: "tabular-nums" }}>{s.pct}%</span>
                </div>
                <div style={{ height: "9px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", borderRadius: "20px", background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW: SMALL STATS ── */}
      <div className="dash-grid-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
        <div style={{ ...CARD, padding: "20px 22px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>Page Views</div>
          <div style={{ marginTop: "8px", fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)", fontVariantNumeric: "tabular-nums" }}>873</div>
          <div style={{ height: "38px", marginTop: "10px" }}>
            <DashboardChart type="area" options={{
              chart: { sparkline: { enabled: true }, foreColor: fg },
              colors: [ACCENT], stroke: { curve: "smooth" as const, width: 2.2 },
              fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.04 } },
              tooltip: { enabled: false }
            }} series={[{ data: [30,34,40,38,46,44,52,50,58,62,60,66] }]} height={38} />
          </div>
        </div>

        <div style={{ ...CARD, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>Bounce Rate</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--dash-primary)", background: "var(--dash-primary-bg)", padding: "3px 8px", borderRadius: "20px" }}>SANGAT BAIK</span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)", fontVariantNumeric: "tabular-nums" }}>13.65%</div>
          <div style={{ marginTop: "14px", height: "9px", borderRadius: "20px", background: "var(--dash-surface-hover)", overflow: "hidden" }}>
            <div style={{ width: "13.65%", height: "100%", borderRadius: "20px", background: "var(--dash-primary)" }} />
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>Rata-rata pentalan kunjungan</div>
        </div>

        <div style={{ ...CARD, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>Durasi Sesi Rata-rata</span>
            <Clock size={14} style={{ color: "var(--dash-primary)" }} />
          </div>
          <div style={{ marginTop: "8px", fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)", fontVariantNumeric: "tabular-nums" }}>2m 39s</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "38px", marginTop: "12px" }}>
            {[40, 65, 50, 85, 70, 95].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 2px 2px", background: h === 85 ? "var(--dash-primary)" : "var(--dash-primary-bg)" }} />
            ))}
          </div>
        </div>

        <div style={{ ...CARD, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)" }}>New vs Returning</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", flex: 1 }}>
            <div style={{ width: "86px", height: "86px" }}>
              <DashboardChart type="donut" options={newReturnOpts} series={[86, 62]} height={86} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: ACCENT }} />
                  <span style={{ fontSize: "0.72rem", color: "var(--dash-text-soft)" }}>Baru</span>
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--dash-text)", marginLeft: "15px" }}>86</div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--dash-text-muted)" }} />
                  <span style={{ fontSize: "0.72rem", color: "var(--dash-text-soft)" }}>Kembali</span>
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--dash-text)", marginLeft: "15px" }}>62</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── POPULAR CONTENT ── */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--dash-text)" }}>Konten Populer</div>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--dash-warning)", background: "var(--dash-warning-bg)", padding: "3px 9px", borderRadius: "20px" }}>GOOGLE ANALYTICS 4</span>
            </div>
            <div style={{ marginTop: "3px", fontSize: "0.78rem", color: "var(--dash-text-soft)" }}>Halaman dengan page views terbanyak</div>
          </div>
        </div>

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
      </div>

      <div style={{ textAlign: "center", padding: "8px 0 4px", fontSize: "0.74rem", color: "var(--dash-text-muted)" }}>
        © {new Date().getFullYear()} DISPARPORA Lampung Timur · Data ditarik dari Google Analytics 4
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
      `}</style>
    </div>
  );
}
