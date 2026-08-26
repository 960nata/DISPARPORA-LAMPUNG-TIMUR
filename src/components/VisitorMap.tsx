"use client";

import { useEffect, useRef, useState } from "react";
import type { Map } from "leaflet";

export interface MapPoint {
  name: string;
  views: number;
  lat: number | null;
  lng: number | null;
}

interface VisitorMapProps {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  fit?: boolean;         // auto-fit bounds to the points (default true when points exist)
  valueLabel?: string;   // tooltip label for the number, e.g. "Page Views" / "Kunjungan"
}

export default function VisitorMap({
  points = [],
  center = [-4.9, 105.7],
  zoom = 9,
  fit = true,
  valueLabel = "Kunjungan",
}: VisitorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isDark, setIsDark] = useState(false);

  const valid = points.filter(p => p.lat != null && p.lng != null) as (MapPoint & { lat: number; lng: number })[];

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsDark(theme === "dark");
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      setIsDark(t === "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let localMap: Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;
      if ((containerRef.current as any)._leaflet_id) return;

      localMap = L.map(containerRef.current, {
        center, zoom, zoomControl: false, attributionControl: false,
      });

      // Esri Canvas basemap — tampilan gray/minimal seperti Carto, tapi tanpa API key.
      const tileUrl = isDark
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      L.tileLayer(tileUrl, {
        maxZoom: 16,
        attribution: "&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
      }).addTo(localMap);
      L.control.zoom({ position: "topright" }).addTo(localMap);

      const accent = isDark ? "#34d399" : "#059669";
      const accentLight = isDark ? "#6bb3d9" : "#5aa3e8";
      const maxV = Math.max(1, ...valid.map(p => p.views));

      valid.forEach(spot => {
        // Circle radius scales with share of the busiest point.
        L.circle([spot.lat, spot.lng], {
          color: accent, fillColor: accent, fillOpacity: 0.12,
          radius: 3000 + (spot.views / maxV) * 45000,
          weight: 1, opacity: 0.3,
        }).addTo(localMap!);

        const marker = L.circleMarker([spot.lat, spot.lng], {
          color: accentLight, fillColor: accentLight, fillOpacity: 0.85,
          radius: 5, weight: 2,
        }).addTo(localMap!);

        marker.bindTooltip(
          `<div style="font-family:system-ui,sans-serif;padding:4px;font-size:0.75rem;font-weight:500;">
             <strong style="color:${accent};">${spot.name}</strong><br/>${valueLabel}: ${spot.views}
           </div>`,
          { direction: "top", opacity: 0.95 }
        );
      });

      if (fit && valid.length > 0) {
        const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng] as [number, number]));
        localMap.fitBounds(bounds.pad(0.35), { maxZoom: 11 });
      }

      if (cancelled) { localMap.remove(); return; }
      mapRef.current = localMap;
    })();

    return () => {
      cancelled = true;
      localMap?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, JSON.stringify(valid.map(p => [p.name, p.views, p.lat, p.lng])), zoom]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "8px" }} />
      {valid.length === 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "16px", fontSize: "0.8rem", color: "var(--dash-text-muted)",
          background: "var(--dash-card)", borderRadius: "8px", pointerEvents: "none",
        }}>
          Belum ada data lokasi. Titik akan muncul saat pengunjung membuka situs (di produksi).
        </div>
      )}
      <style jsx global>{`
        .leaflet-container { background: ${isDark ? "#191919" : "#f7f7f5"} !important; }
        .leaflet-bar { border: 1px solid var(--dash-border) !important; box-shadow: none !important; border-radius: 6px !important; overflow: hidden; }
        .leaflet-bar a { background-color: var(--dash-surface) !important; color: var(--dash-text-muted) !important; border-bottom: 1px solid var(--dash-border) !important; }
        .leaflet-bar a:hover { background-color: var(--dash-surface-hover) !important; color: var(--dash-text) !important; }
        .leaflet-tooltip { background: var(--dash-surface) !important; color: var(--dash-text) !important; border: 1px solid var(--dash-border) !important; border-radius: 6px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}
