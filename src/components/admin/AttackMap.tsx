"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface AttackMapEvent {
  id: string;
  lat: number | null;
  lng: number | null;
  type: string;
  ip: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
}

const RECENT_MS = 5 * 60 * 1000;

export default function AttackMap({ events }: { events: AttackMapEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: [-2.2, 118],
          zoom: 3,
          worldCopyJump: true,
          scrollWheelZoom: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const layer = layerRef.current;
      layer.clearLayers();
      const now = Date.now();

      for (const e of events) {
        if (e.lat == null || e.lng == null) continue;
        const recent = now - new Date(e.createdAt).getTime() < RECENT_MS;
        const icon = L.divIcon({
          className: "atk-icon",
          html: `<span class="atk-marker${recent ? " atk-recent" : ""}"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const loc = [e.city, e.country].filter(Boolean).join(", ") || "Lokasi tidak diketahui";
        L.marker([e.lat, e.lng], { icon })
          .bindPopup(
            `<b>${e.type}</b><br/>IP: ${e.ip ?? "-"}<br/>${loc}<br/>${new Date(e.createdAt).toLocaleString("id-ID")}`
          )
          .addTo(layer);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [events]);

  // Tear down the map instance on unmount.
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "380px", borderRadius: "14px", overflow: "hidden", zIndex: 0 }}
      />
      <style jsx global>{`
        .atk-marker {
          display: block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid #fff;
        }
        .atk-recent {
          animation: atkPulse 1.6s infinite;
        }
        @keyframes atkPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .leaflet-container { font-family: inherit; background: #0b1220; }
        .leaflet-popup-content { font-size: 0.8rem; }
      `}</style>
    </>
  );
}
