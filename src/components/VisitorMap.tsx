"use client";

import { useEffect, useRef, useState } from "react";
import type { Map } from "leaflet";

interface Hotspot {
  name: string;
  views: number;
  lat: number;
  lng: number;
}

const VISITORS_HOTSPOTS: Hotspot[] = [
  { name: "Lampung (Local)", views: 304, lat: -5.1213, lng: 105.2635 },
  { name: "Jakarta (National)", views: 245, lat: -6.2088, lng: 106.8456 },
  { name: "Surabaya", views: 92, lat: -7.2575, lng: 112.7521 },
  { name: "Singapore (Regional)", views: 115, lat: 1.3521, lng: 103.8198 },
  { name: "Sydney (International)", views: 42, lat: -33.8688, lng: 151.2093 },
  { name: "California (US)", views: 60, lat: 37.7749, lng: -122.4194 }
];

export default function VisitorMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme
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
        center: [-2.0, 110.0],
        zoom: 3,
        zoomControl: false,
        attributionControl: false
      });

      // Theme-aware tile layer
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(localMap);
      L.control.zoom({ position: "topright" }).addTo(localMap);

      const accentColor = isDark ? "#34d399" : "#059669";
      const accentLight = isDark ? "#6bb3d9" : "#5aa3e8";

      VISITORS_HOTSPOTS.forEach(spot => {
        L.circle([spot.lat, spot.lng], {
          color: accentColor,
          fillColor: accentColor,
          fillOpacity: 0.12,
          radius: 120000 + spot.views * 800,
          weight: 1,
          opacity: 0.3
        }).addTo(localMap!);

        const marker = L.circleMarker([spot.lat, spot.lng], {
          color: accentLight,
          fillColor: accentLight,
          fillOpacity: 0.8,
          radius: 5,
          weight: 2
        }).addTo(localMap!);

        marker.bindTooltip(`
          <div style="font-family:system-ui,sans-serif;padding:4px;font-size:0.75rem;font-weight:500;">
            <strong style="color:${accentColor};">${spot.name}</strong><br/>
            Page Views: ${spot.views}
          </div>
        `, { direction: "top", opacity: 0.95 });
      });

      if (cancelled) { localMap.remove(); return; }
      mapRef.current = localMap;
    })();

    return () => {
      cancelled = true;
      localMap?.remove();
      mapRef.current = null;
    };
  }, [isDark]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "8px" }} />
      <style jsx global>{`
        .leaflet-container {
          background: ${isDark ? "#191919" : "#f7f7f5"} !important;
        }
        .leaflet-bar {
          border: 1px solid var(--dash-border) !important;
          box-shadow: none !important;
          border-radius: 6px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: var(--dash-surface) !important;
          color: var(--dash-text-muted) !important;
          border-bottom: 1px solid var(--dash-border) !important;
        }
        .leaflet-bar a:hover {
          background-color: var(--dash-surface-hover) !important;
          color: var(--dash-text) !important;
        }
        .leaflet-tooltip {
          background: var(--dash-surface) !important;
          color: var(--dash-text) !important;
          border: 1px solid var(--dash-border) !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </div>
  );
}
