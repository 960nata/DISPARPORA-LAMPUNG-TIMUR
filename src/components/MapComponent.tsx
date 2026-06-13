"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

// Workaround for default marker icon issues in Next.js/Webpack
const setupLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapItem {
  id: string;
  name: string;
  kecamatan: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
  active?: boolean;
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

export default function MapComponent({
  items,
  selectedItem,
  onSelectItem,
  isEditMode = false,
  onCoordinatesChange
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const editMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    setupLeafletIcon();

    if (!mapRef.current || leafletMap.current) return;

    // East Lampung coordinates
    const defaultCenter: [number, number] = [-5.2514, 105.6597];
    const defaultZoom = isEditMode ? 11 : 10;

    // Initialize Map
    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    leafletMap.current = map;
    markersGroup.current = L.layerGroup().addTo(map);

    // If Edit Mode is enabled, add click listener to place coordinate picker marker
    if (isEditMode) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        if (editMarkerRef.current) {
          editMarkerRef.current.setLatLng(e.latlng);
        } else {
          editMarkerRef.current = L.marker(e.latlng, { draggable: true })
            .addTo(map)
            .on("dragend", (event) => {
              const marker = event.target;
              const position = marker.getLatLng();
              if (onCoordinatesChange) {
                onCoordinatesChange(position.lat, position.lng);
              }
            });
        }
        
        if (onCoordinatesChange) {
          onCoordinatesChange(lat, lng);
        }
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isEditMode, onCoordinatesChange]);

  // Update Edit Mode Marker when coordinates change externally (e.g. selection or manual input)
  useEffect(() => {
    if (isEditMode && leafletMap.current && selectedItem) {
      const pos: L.LatLngExpression = [selectedItem.lat, selectedItem.lng];
      leafletMap.current.setView(pos, 13);
      
      if (editMarkerRef.current) {
        editMarkerRef.current.setLatLng(pos);
      } else {
        editMarkerRef.current = L.marker(pos, { draggable: true })
          .addTo(leafletMap.current)
          .on("dragend", (event) => {
            const marker = event.target;
            const position = marker.getLatLng();
            if (onCoordinatesChange) {
              onCoordinatesChange(position.lat, position.lng);
            }
          });
      }
    }
  }, [selectedItem, isEditMode]);

  // Redraw active items markers
  useEffect(() => {
    if (!leafletMap.current || !markersGroup.current || isEditMode) return;

    // Clear previous markers
    markersGroup.current.clearLayers();

    items.forEach((item) => {
      if (!item.lat || !item.lng) return;

      // Color coding markers by category
      let markerColor = "#059669"; // Green (Alam)
      if (item.category === "Wisata Buatan") markerColor = "#d97706"; // Amber
      if (item.category === "Wisata Budaya") markerColor = "#8b5cf6"; // Purple
      if (item.category === "Akomodasi") markerColor = "#3b82f6"; // Blue
      if (item.category === "Kuliner") markerColor = "#ec4899"; // Pink

      // Creating a simple colored SVG icon pin
      const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="${markerColor}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: svgIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Create popup content
      const popupHtml = `
        <div>
          <h4>${item.name}</h4>
          <p style="font-size:0.75rem; font-weight:700; color:${markerColor}; text-transform:uppercase;">${item.category}</p>
          <p style="margin: 4px 0">${item.address || "Kec. " + item.kecamatan}</p>
          ${item.contact ? `<p><strong>Telp:</strong> ${item.contact}</p>` : ""}
          <div style="margin-top: 8px; font-weight:bold; font-size:0.75rem; color:var(--primary);">
            Klik untuk detail selengkapnya
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Marker click event
      marker.on("click", () => {
        onSelectItem(item);
      });

      markersGroup.current?.addLayer(marker);
    });

  }, [items, onSelectItem, isEditMode]);

  // Pan and Zoom map to selected item
  useEffect(() => {
    if (selectedItem && leafletMap.current && !isEditMode) {
      leafletMap.current.setView([selectedItem.lat, selectedItem.lng], 13, {
        animate: true,
        duration: 1.0,
      });

      // Find the marker corresponding to this item and open its popup
      markersGroup.current?.eachLayer((layer: any) => {
        const latlng = layer.getLatLng();
        if (
          Math.abs(latlng.lat - selectedItem.lat) < 0.00001 &&
          Math.abs(latlng.lng - selectedItem.lng) < 0.00001
        ) {
          layer.openPopup();
        }
      });
    }
  }, [selectedItem, isEditMode]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {isEditMode && (
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          pointerEvents: "none"
        }}>
          Klik lokasi pada peta untuk memindahkan pin koordinat.
        </div>
      )}
    </div>
  );
}
