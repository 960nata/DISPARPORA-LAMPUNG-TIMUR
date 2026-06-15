"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Eye, Users, MapPin, FileText, TrendingUp, 
  Activity, Clock, ArrowUpRight, Search
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/contexts/ThemeContext";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeleton";
import DashboardChart from "@/components/DashboardChart";

interface TourismItem { id: string; category: string; active: boolean; kecamatan: string; }
interface NewsPost { id: string; title: string; status: string; createdAt: string; authorName: string; }

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/destinations").then(r => r.json()),
      fetch("/api/posts").then(r => r.json()),
    ]).then(([dest, news]) => {
      if (Array.isArray(dest)) setDestinations(dest);
      if (Array.isArray(news)) setPosts(news);
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

  // ── Mock GA4 Content ──
  const ga4Content = [
    { path: "/", label: "Beranda Utama", views: 304, type: "Landing" },
    { path: "/auth", label: "Halaman Login", views: 50, type: "Auth" },
    { path: "/investment-projects", label: "Proyek Investasi", views: 48, type: "Directory" },
    { path: "/admin", label: "Administrasi", views: 40, type: "Admin" },
    { path: "/leif2025", label: "LEIF 2025", views: 40, type: "Campaign" },
    { path: "/presentation-books", label: "Presentation Books", views: 22, type: "Resource" },
    { path: "/project/852ccaf9", label: "Proyek Kopi Robusta", views: 20, type: "Detail" },
    { path: "/why-lampung", label: "Mengapa Lampung?", views: 20, type: "Info" },
    { path: "/contact", label: "Hubungi Kami", views: 17, type: "Support" },
    { path: "/about", label: "Tentang Forum", views: 16, type: "Info" }
  ];

  const filtered = ga4Content.filter(i =>
    i.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const perPage = 5;
  const paginated = filtered.slice((tablePage - 1) * perPage, tablePage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalViews = 854;

  // ── Chart Configs ──
  const trafficOpts = useMemo(() => ({
    chart: { foreColor: fg, toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: false } },
    colors: ["#059669", "#0284c7"],
    stroke: { curve: "smooth" as const, width: [2.5, 2], dashArray: [0, 4] },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 85, 100] } },
    dataLabels: { enabled: false },
    grid: { borderColor: grid, strokeDashArray: 3, padding: { left: 8, right: 8 } },
    xaxis: { categories: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"], axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (v: number) => `${v}` } },
    tooltip: { theme: ttTheme },
    legend: { position: "top" as const, horizontalAlign: "left" as const, labels: { colors: fg }, markers: { size: 4 }, fontSize: "12px", fontWeight: 500 }
  }), [fg, grid, ttTheme]);

  const trafficSeries = [
    { name: "Total Pengunjung", data: [310,420,380,510,490,620,590,710,680,790,750,854] },
    { name: "Pengunjung Unik", data: [90,110,95,120,115,130,125,140,135,150,142,126] }
  ];

  const sourceOpts = useMemo(() => ({
    labels: ["Direct","Organic","Social","Referral"],
    colors: ["#059669","#0284c7","#d97706","#dc2626"],
    chart: { foreColor: fg },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: ttTheme },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "75%", labels: { show: true, name: { fontSize: "11px", color: fg }, value: { fontSize: "18px", fontWeight: 700, color: textMain }, total: { show: true, label: "Traffic", color: fg, formatter: () => "854" } } } } }
  }), [fg, ttTheme, textMain]);

  const deviceOpts = useMemo(() => ({
    chart: { foreColor: fg },
    colors: ["#059669","#0284c7","#d97706"],
    labels: ["Desktop","Mobile","Tablet"],
    plotOptions: { radialBar: { hollow: { size: "45%" }, track: { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }, dataLabels: { name: { fontSize: "10px", color: fg }, value: { fontSize: "12px", fontWeight: 600, color: textMain }, total: { show: true, label: "Device", fontSize: "10px", color: fg, formatter: () => "55%" } } } },
    stroke: { lineCap: "round" as const },
    legend: { show: false }
  }), [fg, isDark, textMain]);

  const newReturnOpts = useMemo(() => ({
    labels: ["New","Returning"],
    colors: ["#059669","#0284c7"],
    chart: { foreColor: fg },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: ttTheme },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, name: { fontSize: "10px", color: fg }, value: { fontSize: "14px", fontWeight: 700, color: textMain }, total: { show: true, label: "Visitors", fontSize: "9px", color: fg, formatter: () => "148" } } } } }
  }), [fg, ttTheme, textMain]);

  // ── Stat Cards Config ──
  const stats = [
    { label: "Total Pengunjung", value: "854", sub: "0.0% dari bulan lalu", icon: Eye, accent: "var(--dash-primary)" },
    { label: "Pengunjung Unik", value: "126", sub: "0.0% dari bulan lalu", icon: Users, accent: "var(--dash-success)" },
    { label: "Proyek Aktif", value: String(activeCount || 67), sub: "0 proyek baru", icon: MapPin, accent: "var(--dash-warning)" },
    { label: "Berita Terpublikasi", value: String(publishedCount || 4), sub: "0 artikel baru", icon: FileText, accent: "var(--dash-danger)" },
  ];

  const badgeColor = (type: string) => {
    const map: Record<string, string> = {
      Landing: "dash-badge-primary", Auth: "dash-badge-warning", Directory: "dash-badge-success",
      Admin: "dash-badge-danger", Campaign: "dash-badge-purple", Resource: "dash-badge-primary",
      Detail: "dash-badge-success", Info: "dash-badge-primary", Support: "dash-badge-warning"
    };
    return map[type] || "dash-badge-primary";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Greeting ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--dash-text)", margin: 0, lineHeight: 1.3 }}>
            Selamat datang, {user?.name || "Admin"} 👋
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
            Ringkasan data portal investasi dan performa digital.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 500 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }} className="grid-stat-cards">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }} className="grid-stat-cards">
          {stats.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="dash-stat-card" style={{ borderLeft: `3px solid ${card.accent === "var(--dash-primary)" ? "#059669" : card.accent === "var(--dash-success)" ? "#0284c7" : card.accent === "var(--dash-warning)" ? "#d97706" : "#dc2626"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--dash-text-muted)", letterSpacing: "0.01em" }}>{card.label}</span>
                    <span style={{ fontSize: "1.65rem", color: "var(--dash-text)", fontWeight: 700, lineHeight: 1.2 }}>{card.value}</span>
                  </div>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `color-mix(in srgb, ${card.accent} 8%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Icon size={17} style={{ color: card.accent }} />
                  </div>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                  <TrendingUp size={10} style={{ color: card.accent }} /> {card.sub}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Row 1: Traffic Chart + Source/Device ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "14px", alignItems: "stretch" }} className="grid-charts">
        {/* Traffic Area Chart */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Trafik Pengunjung</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>12 bulan terakhir</p>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: "280px" }}>
            <DashboardChart type="area" options={trafficOpts} series={trafficSeries} height="100%" />
          </div>
        </div>

        {/* Source Donut + Device Radial */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Source */}
          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dash-text)", margin: "0 0 4px" }}>Sumber Traffic</h4>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardChart type="donut" options={sourceOpts} series={[384,257,128,85]} height={180} />
            </div>
            {/* Legend */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
              {[
                { color: "#059669", label: "Direct", pct: "45%" },
                { color: "#0284c7", label: "Organic", pct: "30%" },
                { color: "#d97706", label: "Social", pct: "15%" },
                { color: "#dc2626", label: "Referral", pct: "10%" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flexShrink: 0 }} />
                  <span style={{ color: "var(--dash-text-muted)" }}>{s.label}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--dash-text)" }}>{s.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device */}
          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dash-text)", margin: "0 0 4px" }}>Device Overview</h4>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardChart type="radialBar" options={deviceOpts} series={[55,40,5]} height={160} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "4px" }}>
              {[
                { color: "#059669", label: "Desktop", val: "55%" },
                { color: "#0284c7", label: "Mobile", val: "40%" },
                { color: "#d97706", label: "Tablet", val: "5%" },
              ].map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.68rem" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: d.color }} />
                  <span style={{ color: "var(--dash-text-muted)" }}>{d.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>{d.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Map + Performance Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }} className="grid-charts">
        {/* Map */}
        <div className="dash-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Distribusi Pengunjung</h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>Berdasarkan data GA4</p>
          </div>
          <div style={{ flex: 1, minHeight: "300px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
            <VisitorMap />
          </div>
        </div>

        {/* GA4 Performance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Bounce Rate */}
            <div className="dash-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 500 }}>Bounce Rate</span>
                <Clock size={13} style={{ color: "var(--dash-primary)" }} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--dash-text)", margin: "8px 0 0" }}>12.37%</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--dash-success)", fontWeight: 600 }}>Rata-rata sehat</p>
              </div>
            </div>

            {/* Avg Session */}
            <div className="dash-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 500 }}>Avg Session</span>
                <Activity size={13} style={{ color: "var(--dash-success)" }} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--dash-text)", margin: "8px 0 0" }}>2m 29s</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--dash-primary)", fontWeight: 600 }}>Interaksi tinggi</p>
              </div>
            </div>
          </div>

          {/* Page Views */}
          <div className="dash-card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 500 }}>Page Views</span>
              <h4 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--dash-text)", margin: "4px 0 0" }}>854 <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--dash-text-muted)" }}>views</span></h4>
            </div>
            <div style={{ width: "120px", height: "50px" }}>
              <DashboardChart type="area" options={{
                chart: { sparkline: { enabled: true }, foreColor: fg },
                colors: ["#059669"], stroke: { curve: "smooth" as const, width: 2 },
                fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
                tooltip: { enabled: false }
              }} series={[{ data: [310,420,380,510,490,620,590,710,680,790,750,854] }]} height={50} />
            </div>
          </div>

          {/* New vs Returning */}
          <div className="dash-card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 500 }}>New vs Returning</span>
              <h4 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--dash-text)", margin: "4px 0 0" }}>148 <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--dash-text-muted)" }}>visitors</span></h4>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem", marginTop: "4px" }}>
                <span style={{ color: "var(--dash-primary)", fontWeight: 600 }}>New: 68%</span>
                <span style={{ color: "var(--dash-success)", fontWeight: 600 }}>Return: 32%</span>
              </div>
            </div>
            <div style={{ width: "80px", height: "80px" }}>
              <DashboardChart type="donut" options={newReturnOpts} series={[101,47]} height={80} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Popular Content Table ── */}
      <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Popular Content</h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>Halaman dengan tayangan tertinggi</p>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
            <input
              type="text" placeholder="Cari halaman..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setTablePage(1); }}
              className="dash-input" style={{ maxWidth: "200px", paddingLeft: "30px", fontSize: "0.78rem" }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Halaman</th>
                <th>URL</th>
                <th>Tipe</th>
                <th style={{ width: "22%" }}>Proporsi</th>
                <th style={{ textAlign: "right" }}>Views</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--dash-text-muted)" }}>Tidak ditemukan.</td></tr>
              ) : (
                paginated.map(item => {
                  const pct = ((item.views / totalViews) * 100).toFixed(1);
                  return (
                    <tr key={item.path}>
                      <td style={{ fontWeight: 600, color: "var(--dash-text)" }}>{item.label}</td>
                      <td><code style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", padding: "2px 6px", borderRadius: "4px" }}>{item.path}</code></td>
                      <td><span className={`dash-badge ${badgeColor(item.type)}`}>{item.type}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "5px", backgroundColor: "var(--dash-surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--dash-primary), var(--dash-success))", borderRadius: "3px", transition: "width 0.5s ease" }} />
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)", width: "35px", textAlign: "right", fontWeight: 500 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--dash-text)", fontSize: "0.85rem" }}>{item.views.toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <a href={item.path} target="_blank" rel="noreferrer" style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "26px", height: "26px", borderRadius: "6px", border: "1px solid var(--dash-border)",
                          color: "var(--dash-text-muted)", textDecoration: "none", transition: "all 0.15s"
                        }}>
                          <ArrowUpRight size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--dash-border)", paddingTop: "12px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>
              {((tablePage - 1) * perPage) + 1}–{Math.min(tablePage * perPage, filtered.length)} dari {filtered.length}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1} className="dash-btn dash-btn-secondary" style={{ padding: "4px 12px", fontSize: "0.72rem" }}>Prev</button>
              <button onClick={() => setTablePage(p => Math.min(totalPages, p + 1))} disabled={tablePage === totalPages} className="dash-btn dash-btn-secondary" style={{ padding: "4px 12px", fontSize: "0.72rem" }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive grid overrides */}
      <style jsx global>{`
        @media (max-width: 1100px) {
          .grid-stat-cards { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .grid-stat-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
