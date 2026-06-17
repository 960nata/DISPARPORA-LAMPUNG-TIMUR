"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker, Popup } from "leaflet";

interface MapItem {
  id: string;
  name: string;
  kecamatan: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
  active?: boolean;
  verified?: boolean;
  approx?: boolean;
  image?: string;
  facilities?: string[];
  contact?: string;
  map_link?: string;
}

interface MapComponentProps {
  items: MapItem[];
  selectedItem: MapItem | null;
  onSelectItem: (item: MapItem) => void;
  isEditMode?: boolean;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

const CAT_COLORS: Record<string, string> = {
  "Wisata Alam":   "#059669",
  "Wisata Buatan": "#d97706",
  "Wisata Budaya": "#8b5cf6",
  "Akomodasi":     "#3b82f6",
  "Kuliner":       "#ec4899",
};

const CAT_ICONS: Record<string, string> = {
  "Wisata Alam":   "🌿",
  "Wisata Buatan": "🎡",
  "Wisata Budaya": "🏛",
  "Akomodasi":     "🏨",
  "Kuliner":       "🍽",
};

function makePinSvg(color: string, emoji: string, isSelected = false, verified = false, approx = false) {
  const outerR  = 14;
  const ringW   = isSelected ? 3.5 : 2.5;
  const dotR    = outerR - ringW - 5;
  const size    = isSelected ? 48 : 38;
  const opacity = approx ? "0.55" : "1";

  const glow = isSelected
    ? `<circle cx="18" cy="16" r="18" fill="${color}" opacity="0.18"/>`
    : verified
    ? `<circle cx="18" cy="16" r="17" fill="${color}" opacity="0.10"/>`
    : "";

  // Verified badge: small checkmark ring at top-right of pin
  const badge = verified && !approx
    ? `<circle cx="27" cy="6" r="5" fill="white"/>
       <circle cx="27" cy="6" r="4" fill="#16a34a"/>
       <text x="27" y="10" text-anchor="middle" font-size="6.5" font-family="sans-serif" fill="white">✓</text>`
    : approx
    ? `<circle cx="27" cy="6" r="5" fill="white"/>
       <circle cx="27" cy="6" r="4" fill="#94a3b8"/>
       <text x="27" y="9.5" text-anchor="middle" font-size="7" font-family="sans-serif" fill="white">~</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 36 46" opacity="${opacity}" style="filter:drop-shadow(0 3px 8px rgba(0,0,0,${approx ? "0.18" : "0.32"}))">
  ${glow}
  <path d="M18 42 L11 23 Q18 28 25 23 Z" fill="${color}"/>
  <circle cx="18" cy="16" r="${outerR}" fill="${color}"/>
  <circle cx="18" cy="16" r="${outerR - ringW}" fill="white"/>
  <circle cx="18" cy="16" r="${dotR}" fill="${color}" opacity="0.85"/>
  <text x="18" y="21" text-anchor="middle" font-size="10" font-family="sans-serif">${emoji}</text>
  ${badge}
</svg>`;
}

function makeEditPinSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 36 46" style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.42))">
  <circle cx="18" cy="16" r="17" fill="#059669" opacity="0.12"/>
  <path d="M18 42 L11 23 Q18 28 25 23 Z" fill="#059669"/>
  <circle cx="18" cy="16" r="14" fill="#059669"/>
  <circle cx="18" cy="16" r="10" fill="white"/>
  <line x1="18" y1="9"  x2="18" y2="23" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="11" y1="16" x2="25" y2="16" stroke="#059669" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="18" cy="16" r="2.5" fill="#059669"/>
</svg>`;
}

export default function MapComponent({
  items, selectedItem, onSelectItem, isEditMode = false, onCoordinatesChange,
}: MapComponentProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<Map | null>(null);
  const markersRef    = useRef<Marker[]>([]);
  const markersMapRef = useRef<Record<string, Marker>>({});
  const editMkRef     = useRef<Marker | null>(null);
  const popupRef      = useRef<Popup | null>(null);

  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  const selectRef = useRef(onSelectItem);
  const coordRef  = useRef(onCoordinatesChange);
  useEffect(() => { selectRef.current = onSelectItem; },        [onSelectItem]);
  useEffect(() => { coordRef.current  = onCoordinatesChange; }, [onCoordinatesChange]);

  // ── Init Leaflet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let localMap: Map | null = null;

    (async () => {
      const L   = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Abort if cleanup ran while awaiting imports (React StrictMode double-invoke)
      if (cancelled || !containerRef.current) return;

      // Guard: container already has a Leaflet instance — don't double-init
      if ((containerRef.current as any)._leaflet_id) return;

      localMap = L.map(containerRef.current, {
        center: [-5.2514, 105.6597],
        zoom: isEditMode ? 12 : 10,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(localMap);

      L.control.zoom({ position: "topright" }).addTo(localMap);

      if (isEditMode) {
        localMap.getContainer().style.cursor = "crosshair";
        localMap.on("click", (e) => {
          const { lat, lng } = e.latlng;
          const icon = L.divIcon({ html: makeEditPinSvg(), iconSize: [44, 54], iconAnchor: [22, 54], className: "" });
          if (editMkRef.current) {
            try {
              editMkRef.current.setLatLng([lat, lng]);
            } catch (err) {}
          } else {
            try {
              editMkRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(localMap!);
              editMkRef.current.on("dragend", () => {
                const pos = editMkRef.current!.getLatLng();
                coordRef.current?.(pos.lat, pos.lng);
              });
            } catch (err) {}
          }
          coordRef.current?.(lat, lng);
        });
      }

      if (cancelled) {
        try {
          localMap.remove();
        } catch (err) {}
        return;
      }

      mapRef.current = localMap;
      setMapInstance(localMap);
    })();

    return () => {
      cancelled = true;
      if (localMap) {
        try {
          localMap.remove();
        } catch (err) {}
      }
      mapRef.current  = null;
      setMapInstance(null);
      editMkRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // ── Draw markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode || !mapInstance) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || mapInstance !== mapRef.current) return;

      // Safely remove existing markers
      markersRef.current.forEach(m => {
        try { m.remove(); } catch (err) {}
      });
      markersRef.current = [];
      markersMapRef.current = {};
      try { popupRef.current?.remove(); } catch (err) {}
      popupRef.current = null;

      items.forEach(item => {
        if (!item.lat || !item.lng || cancelled || mapInstance !== mapRef.current) return;
        const color = CAT_COLORS[item.category] ?? "#059669";
        const emoji = CAT_ICONS[item.category]  ?? "📍";
        const isSel = selectedItem?.id === item.id;
        const iconW = isSel ? 48 : 38;
        const iconH = isSel ? 58 : 48;

        const icon = L.divIcon({
          html: makePinSvg(color, emoji, isSel, !!item.verified, !!item.approx),
          iconSize:   [iconW, iconH],
          iconAnchor: [iconW / 2, iconH],
          className: "",
        });

        const popupContent = `
          <div style="font-family:system-ui,sans-serif;padding:2px 0">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;display:block;margin:0 0 8px" onerror="this.style.display='none'"/>` : ""}
            <p style="font-size:.6rem;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.07em;margin:0 0 5px;display:flex;align-items:center;gap:4px">${item.category}${item.verified ? ' <span style="background:#dcfce7;color:#16a34a;padding:1px 5px;border-radius:4px;font-size:.55rem">✓ GPS Akurat</span>' : item.approx ? ' <span style="background:#f1f5f9;color:#64748b;padding:1px 5px;border-radius:4px;font-size:.55rem">~ Perkiraan</span>' : ''}</p>
            <h4 style="font-size:.9rem;font-weight:800;color:#0f172a;margin:0 0 5px;line-height:1.3">${item.name}</h4>
            <p style="font-size:.78rem;color:#475569;margin:0 0 2px">📍 ${item.address || "Kec. " + item.kecamatan}</p>
            ${item.contact ? `<p style="font-size:.78rem;color:#475569;margin:3px 0 0">📞 ${item.contact}</p>` : ""}
            <a href="/destinasi/${item.id}" style="display:flex;align-items:center;justify-content:center;gap:6px;background:${color};color:white;font-weight:700;font-size:.8rem;padding:8px 12px;border-radius:10px;text-decoration:none;margin-top:10px;border-top:1px solid #e2e8f0;padding-top:10px">Lihat Detail →</a>
          </div>
        `;

        try {
          const marker = L.marker([item.lat, item.lng], { icon })
            .bindPopup(popupContent, { offset: [0, -8], closeButton: true, maxWidth: 280, className: "simad-popup" })
            .addTo(mapInstance);

          marker.on("click", () => { selectRef.current(item); });

          markersRef.current.push(marker);
          markersMapRef.current[item.id] = marker;
        } catch (err) {}
      });
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach(m => { try { m.remove(); } catch (err) {} });
      markersRef.current = [];
      markersMapRef.current = {};
      try { popupRef.current?.remove(); } catch (err) {}
      popupRef.current = null;
    };
  }, [items, selectedItem, isEditMode, mapInstance]);

  // ── Fly to selected + open popup after animation ends ─────────────────────
  useEffect(() => {
    if (!selectedItem || isEditMode || !mapInstance) return;
    let cancelled = false;
    const id = selectedItem.id;

    const handleMoveEnd = () => {
      if (cancelled) return;
      const marker = markersMapRef.current[id];
      if (marker) { try { marker.openPopup(); } catch (err) {} }
    };

    try {
      mapInstance.flyTo([selectedItem.lat, selectedItem.lng], 13, { duration: 1.2 });
      (mapInstance as any).once("moveend", handleMoveEnd);
    } catch (err) {}

    return () => {
      cancelled = true;
      try { (mapInstance as any).off("moveend", handleMoveEnd); } catch (err) {}
    };
  }, [selectedItem, isEditMode, mapInstance]);

  // ── Sync edit marker to loaded item ──────────────────────────────────────
  useEffect(() => {
    if (!isEditMode || !selectedItem || !mapInstance) return;

    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || mapInstance !== mapRef.current) return;

      try {
        mapInstance.flyTo([selectedItem.lat, selectedItem.lng], 13, { duration: 0.9 });
      } catch (err) {}

      const icon = L.divIcon({ html: makeEditPinSvg(), iconSize: [44, 54], iconAnchor: [22, 54], className: "" });

      if (editMkRef.current) {
        try {
          editMkRef.current.setLatLng([selectedItem.lat, selectedItem.lng]);
        } catch (err) {}
      } else {
        try {
          const marker = L.marker([selectedItem.lat, selectedItem.lng], { icon, draggable: true }).addTo(mapInstance);
          editMkRef.current = marker;
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            coordRef.current?.(pos.lat, pos.lng);
          });
        } catch (err) {}
      }
    })();

    return () => {
      cancelled = true;
      if (editMkRef.current) {
        try {
          editMkRef.current.remove();
        } catch (err) {}
        editMkRef.current = null;
      }
    };
  }, [selectedItem, isEditMode, mapInstance]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {isEditMode && (
        <div style={{
          position: "absolute", bottom: 12, left: 12, zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
          color: "white", padding: "6px 12px", borderRadius: "8px",
          fontSize: "0.75rem", fontWeight: 600, pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          🎯 Klik peta atau seret pin untuk atur koordinat
        </div>
      )}

      <style>{`
        .simad-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.16);
          border: 1px solid #e2e8f0;
          padding: 0;
        }
        .simad-popup .leaflet-popup-content { margin: 14px 16px; }
        .simad-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.13) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #374151 !important;
          font-weight: 700 !important;
          background: white !important;
        }
        .leaflet-control-zoom a:last-child { border-bottom: none !important; }
        .leaflet-control-zoom a:hover { background: #f8fafc !important; color: #059669 !important; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution { font-size: 10px !important; opacity: 0.6; }
      `}</style>
    </div>
  );
}
