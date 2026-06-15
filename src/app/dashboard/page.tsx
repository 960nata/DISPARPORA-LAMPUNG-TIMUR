"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, FileText, Users, ArrowRight, TrendingUp, Activity, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { useAdmin } from "@/contexts/AdminContext";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeleton";
import DashboardChart from "@/components/DashboardChart";

interface TourismItem { id: string; category: string; active: boolean; kecamatan: string; }
interface NewsPost { id: string; title: string; status: string; createdAt: string; authorName: string; }

const CAT_COLORS: Record<string, string> = {
  "Wisata Alam": "#059669", "Wisata Buatan": "#d97706", "Wisata Budaya": "#8b5cf6", "Akomodasi": "#3b82f6"
};

export default function DashboardPage() {
  const { user } = useAdmin();
  const [destinations, setDestinations] = useState<TourismItem[]>([]);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/destinations").then(r => r.json()),
      fetch("/api/posts").then(r => r.json()),
    ]).then(([dest, news]) => {
      if (Array.isArray(dest)) setDestinations(dest);
      if (Array.isArray(news)) setPosts(news);
    }).finally(() => setLoading(false));
  }, []);

  const activeCount = destinations.filter(d => d.active).length;
  const totalAlam    = destinations.filter(d => d.category === "Wisata Alam").length;
  const totalBuatan  = destinations.filter(d => d.category === "Wisata Buatan").length;
  const totalBudaya  = destinations.filter(d => d.category === "Wisata Budaya").length;
  const totalAkomo   = destinations.filter(d => d.category === "Akomodasi").length;
  const totalNews    = posts.filter(p => p.status === "published").length;
  const activePercent = destinations.length ? Math.round(activeCount / destinations.length * 100) : 0;

  const kecamatans = ["Sukadana","Labuhan Maringgai","Labuhan Ratu","Bandar Sribhawono","Sekampung Udik","Pekalongan","Pasir Sakti","Way Jepara","Mataram Baru"];
  const wisataByKec = kecamatans.map(k => destinations.filter(d => d.kecamatan.toLowerCase() === k.toLowerCase() && d.category.startsWith("Wisata")).length);
  const akomoByKec  = kecamatans.map(k => destinations.filter(d => d.kecamatan.toLowerCase() === k.toLowerCase() && d.category === "Akomodasi").length);

  const barOptions = {
    chart: { foreColor: "#9ca3af", toolbar: { show: false } },
    colors: ["#6366f1", "#10b981"],
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: kecamatans.map(k => k.split(" ")[0]) },
    yaxis: { title: { text: "Jumlah" } },
    fill: { opacity: 1 },
    tooltip: { theme: "dark", y: { formatter: (v: number) => `${v} Objek` } },
    legend: { labels: { colors: "#9ca3af" } },
  };
  const barSeries = [
    { name: "Destinasi Wisata", data: wisataByKec },
    { name: "Akomodasi", data: akomoByKec },
  ];
  const donutOptions = {
    labels: ["Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"],
    colors: ["#059669", "#d97706", "#8b5cf6", "#3b82f6"],
    chart: { foreColor: "#9ca3af" },
    legend: { position: "bottom" as const, labels: { colors: "#9ca3af" } },
    tooltip: { theme: "dark" },
    stroke: { show: false },
  };
  const radialOptions = {
    chart: { foreColor: "#9ca3af" },
    colors: ["#10b981"],
    plotOptions: { radialBar: { hollow: { size: "65%" }, dataLabels: { show: true, name: { show: true, fontSize: "13px", color: "#9ca3af" }, value: { fontSize: "22px", color: "#f9fafb", formatter: (v: number) => `${v}%` } } } },
    labels: ["Aktif"],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Welcome */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "white" }}>
            Selamat datang, {user?.name} 👋
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "0.2rem" }}>
            SIMAD — Sistem Manajemen Disparpora Lampung Timur
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/dashboard/berita/buat" className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", textDecoration: "none", padding: "0.5rem 0.9rem" }}>
            <FileText size={15} /> Buat Artikel
          </Link>
          <Link href="/dashboard/destinasi" className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", textDecoration: "none", padding: "0.5rem 0.9rem", backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>
            <MapPin size={15} /> Kelola Destinasi
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Total Destinasi", value: destinations.length, sub: `${activeCount} aktif`, color: "var(--dash-primary)", icon: <MapPin size={20} />, href: "/dashboard/destinasi" },
            { label: "Berita Terbit", value: totalNews, sub: `${posts.length} total artikel`, color: "var(--dash-success)", icon: <FileText size={20} />, href: "/dashboard/berita" },
            { label: "Wisata Alam", value: totalAlam, sub: "kategori terbanyak", color: "#059669", icon: <TrendingUp size={20} />, href: "/dashboard/destinasi" },
            { label: "Objek Aktif", value: `${activePercent}%`, sub: `${activeCount} dari ${destinations.length}`, color: "#8b5cf6", icon: <Activity size={20} />, href: "/dashboard/destinasi" },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div className="dash-stat-card" style={{ "--dash-stat-accent": s.color } as React.CSSProperties}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
                  <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
                </div>
                <h3 style={{ fontSize: "1.9rem", color: "white", fontWeight: 800, margin: "0 0 0.35rem", letterSpacing: "-0.02em" }}>{s.value}</h3>
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>{s.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1.25rem" }} className="grid-charts-loader">
          <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1.25rem" }} className="grid-charts">
          <div className="dash-card">
            <p style={{ margin: "0 0 1rem", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Sebaran Per Kecamatan</p>
            <DashboardChart type="bar" options={barOptions} series={barSeries} height={250} />
          </div>
          <div className="dash-card">
            <p style={{ margin: "0 0 1rem", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Komposisi Kategori</p>
            <DashboardChart type="donut" options={donutOptions} series={[totalAlam, totalBuatan, totalBudaya, totalAkomo]} height={250} />
          </div>
          <div className="dash-card">
            <p style={{ margin: "0 0 1rem", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Objek Aktif</p>
            <DashboardChart type="radialBar" options={radialOptions} series={[activePercent]} height={250} />
          </div>
        </div>
      )}

      {/* Recent News */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="grid-charts">
        <div className="dash-card" style={{ padding: 0 }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Artikel Terbaru</p>
            <Link href="/dashboard/berita" style={{ fontSize: "0.75rem", color: "var(--dash-primary)", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}>Lihat semua <ArrowRight size={13} /></Link>
          </div>
          {loading ? <div style={{ padding: "2rem", color: "var(--dash-text-muted)", textAlign: "center" }}>Memuat...</div> : (
            <div>
              {posts.slice(0, 5).map(p => (
                <div key={p.id} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--dash-text-muted)", marginTop: "0.15rem" }}>{p.authorName} · {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`dash-badge ${p.status === "published" ? "dash-badge-success" : "dash-badge-warning"}`} style={{ flexShrink: 0 }}>
                    {p.status === "published" ? "Terbit" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-card" style={{ padding: 0 }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Komposisi Kategori</p>
            <Link href="/dashboard/destinasi" style={{ fontSize: "0.75rem", color: "var(--dash-primary)", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}>Lihat semua <ArrowRight size={13} /></Link>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Wisata Alam",   value: totalAlam,   color: "#059669" },
              { label: "Wisata Buatan", value: totalBuatan, color: "#d97706" },
              { label: "Wisata Budaya", value: totalBudaya, color: "#8b5cf6" },
              { label: "Akomodasi",     value: totalAkomo,  color: "#3b82f6" },
            ].map(c => {
              const pct = destinations.length ? Math.round(c.value / destinations.length * 100) : 0;
              return (
                <div key={c.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>{c.label}</span>
                    <span style={{ fontSize: "0.78rem", color: c.color, fontWeight: 700 }}>{c.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", backgroundColor: "var(--dash-card-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: c.color, borderRadius: "999px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .grid-charts { grid-template-columns: 1fr !important; }
          .grid-charts-loader { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
