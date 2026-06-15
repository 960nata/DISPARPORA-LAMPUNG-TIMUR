"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const years  = ["2021", "2022", "2023", "2024", "2025"];
const values = [35000, 120000, 195000, 280000, 430000];

const options: ApexOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "var(--font-main)",
    background: "transparent",
    animations: {
      enabled: true,
      speed: 700,
      dynamicAnimation: { enabled: true, speed: 700 },
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "50%",
      distributed: true,
    },
  },
  colors: ["#34d399", "#10b981", "#059669", "#047857", "#065f46"],
  dataLabels: {
    enabled: true,
    formatter: (val: number) => {
      if (val >= 1000) return (val / 1000).toFixed(0) + " rb";
      return String(val);
    },
    style: { fontSize: "0.75rem", fontWeight: "700", colors: ["#ffffff"] },
    offsetY: -4,
  },
  xaxis: {
    categories: years,
    labels: {
      style: { fontSize: "0.85rem", fontWeight: "700", colors: Array(5).fill("#1e293b") },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        if (val >= 1000) return (val / 1000).toFixed(0) + " rb";
        return String(val);
      },
      style: { fontSize: "0.78rem", colors: ["#64748b"] },
    },
  },
  grid: {
    borderColor: "#e2e8f0",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  legend: { show: false },
  tooltip: {
    custom: ({ series, dataPointIndex }: { series: number[][], dataPointIndex: number }) => {
      const growths: (string | null)[] = [null, "+243%", "+63%", "+44%", "+54%"];
      const val = series[0][dataPointIndex];
      const growth = growths[dataPointIndex];
      const formatted = val.toLocaleString("id-ID");
      return `
        <div style="padding:10px 14px;font-family:'Plus Jakarta Sans',sans-serif;min-width:160px">
          <div style="font-size:.7rem;font-weight:700;color:#64748b;margin-bottom:4px">${years[dataPointIndex]}</div>
          <div style="font-size:.95rem;font-weight:800;color:#0f172a">${formatted} wisatawan</div>
          ${growth ? `<div style="margin-top:6px;display:inline-block;background:#ecfdf5;color:#059669;font-size:.75rem;font-weight:800;padding:2px 10px;border-radius:999px">${growth} vs tahun sebelumnya</div>` : ""}
        </div>
      `;
    },
  },
};

export default function StatisticsSection() {
  return (
    <section style={{ padding: "5rem 0", background: "linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 60%, #ffffff 100%)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.75rem", marginBottom: "3rem" }}>
          <h2 className="section-heading" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", margin: 0 }}>
            Pertumbuhan Wisatawan<br />Kabupaten Lampung Timur
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: 1.7, margin: 0 }}>
            Estimasi kunjungan wisatawan berbasis data TNWK dan destinasi unggulan Kabupaten Lampung Timur 2021–2025. Pada 2025, Lampung Timur masuk 5 besar destinasi favorit di Provinsi Lampung.
          </p>
        </div>

        {/* Stat cards */}
        <div className="stat-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            {
              value: "5", label: "Bidang Kerja",
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
            },
            {
              value: "24", label: "Kecamatan",
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
            },
            {
              value: "264", label: "Desa & Kelurahan",
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            },
            {
              value: "71+", label: "Destinasi Wisata",
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><path d="M12 2l1.5 3.5L17 6.5l-2.5 2.5.5 3.5L12 11l-3 1.5.5-3.5L7 6.5l3.5-.5z"/></svg>,
            },
          ].map(({ value, label, icon }) => (
            <div key={label} style={{
              background: "white",
              borderRadius: "20px",
              padding: "1.5rem",
              boxShadow: "var(--card-shadow)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              textAlign: "center",
              border: "1px solid #d1fae5",
            }}>
              <div style={{
                width: "52px", height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #059669, #065f46)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 900, color: "#059669", margin: "0 0 2px", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", margin: 0, lineHeight: 1.3 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "var(--card-shadow)",
        }}>
          <Chart
            type="bar"
            height={340}
            series={[{ name: "Wisatawan", data: values }]}
            options={options}
          />
        </div>

        <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1.5rem", textAlign: "center" }}>
          * Data estimasi/proxy berdasarkan laporan kunjungan TNWK dan potensi wisata Lampung Timur. Angka dapat berbeda dari data resmi BPS.
        </p>
      </div>
    </section>
  );
}
