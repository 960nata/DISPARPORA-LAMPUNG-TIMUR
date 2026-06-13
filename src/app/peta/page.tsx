"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Phone, ExternalLink, Filter, Search, ArrowLeft, TreePine, Milestone, Landmark, Hotel, Utensils, Star } from "lucide-react";
import Link from "next/link";
import tourismData from "@/data/tourism.json";
import { MapSkeleton } from "@/components/Skeleton";

// Dynamically import MapComponent to prevent SSR errors (window is not defined)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />
});

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
  classification?: string;
  rooms?: number;
  food_type?: string;
  capacity?: number;
}

function MapPageContent() {
  const searchParams = useSearchParams();

  // Load all items with appropriate categories
  const allItems: MapItem[] = [
    ...tourismData.wisata_alam.map(i => ({ ...i, category: "Wisata Alam" })),
    ...tourismData.wisata_buatan.map(i => ({ ...i, category: "Wisata Buatan" })),
    ...tourismData.wisata_budaya.map(i => ({ ...i, category: "Wisata Budaya" })),
    ...tourismData.hotels.map(i => ({ ...i, category: "Akomodasi" })),
    ...tourismData.restaurants.map(i => ({ ...i, category: "Kuliner" }))
  ].filter(i => i.lat && i.lng); // only items with coordinates

  // States
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"]); // culinary default off to avoid clutter
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  // Sync with URL query parameters (?id=xxx)
  useEffect(() => {
    const itemId = searchParams.get("id");
    if (itemId) {
      const matched = allItems.find(item => item.id === itemId);
      if (matched) {
        // Ensure its category is checked
        if (!selectedFilters.includes(matched.category)) {
          setSelectedFilters(prev => [...prev, matched.category]);
        }
        setSelectedItem(matched);
      }
    }
  }, [searchParams]);

  // Handle Category Filter Toggle
  const toggleFilter = (category: string) => {
    if (selectedFilters.includes(category)) {
      setSelectedFilters(prev => prev.filter(c => c !== category));
      if (selectedItem && selectedItem.category === category) {
        setSelectedItem(null);
      }
    } else {
      setSelectedFilters(prev => [...prev, category]);
    }
  };

  // Filtered List
  const displayItems = allItems.filter(item => {
    const matchesFilter = selectedFilters.includes(item.category);
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = [
    { name: "Wisata Alam", color: "#059669", icon: <TreePine size={16} /> },
    { name: "Wisata Buatan", color: "#d97706", icon: <Milestone size={16} /> },
    { name: "Wisata Budaya", color: "#8b5cf6", icon: <Landmark size={16} /> },
    { name: "Akomodasi", color: "#3b82f6", icon: <Hotel size={16} /> },
    { name: "Kuliner", color: "#ec4899", icon: <Utensils size={16} /> }
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", overflow: "hidden", flexDirection: "column" }} className="map-page-wrapper">
      {/* Mobile Header indicator */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", backgroundColor: "white", padding: "0.75rem 1rem", alignItems: "center", justifyContent: "space-between" }} className="mobile-map-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>PETA WISATA</span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "row" }} className="map-content-split">
        {/* Left Sidebar */}
        <aside style={{
          width: "360px",
          backgroundColor: "white",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          flexShrink: 0
        }} className="map-sidebar">
          {/* Search bar inside Sidebar */}
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "0.5rem 0.75rem",
              backgroundColor: "var(--bg-primary)"
            }}>
              <Search size={18} style={{ color: "var(--text-secondary)", marginRight: "0.5rem" }} />
              <input
                type="text"
                placeholder="Cari destinasi wisata..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "0.9rem",
                  background: "transparent",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {categories.map(cat => {
                const isActive = selectedFilters.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    onClick={() => toggleFilter(cat.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "99px",
                      border: isActive ? `1px solid ${cat.color}` : "1px solid var(--border)",
                      backgroundColor: isActive ? cat.color : "transparent",
                      color: isActive ? "white" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {cat.icon}
                    {cat.name.split(" ")[1] || cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory lists inside sidebar */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {selectedItem ? (
              // Selected Item Detail View
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar
                </button>

                <div>
                  <span className="badge" style={{
                    backgroundColor: `${categories.find(c => c.name === selectedItem.category)?.color}15`,
                    color: categories.find(c => c.name === selectedItem.category)?.color,
                    marginBottom: "0.5rem"
                  }}>
                    {selectedItem.category}
                  </span>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>{selectedItem.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    <MapPin size={14} />
                    <span>Kecamatan {selectedItem.kecamatan}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>Alamat Lengkap:</h4>
                    <p style={{ fontSize: "0.85rem" }}>{selectedItem.address || `Kecamatan ${selectedItem.kecamatan}, Lampung Timur`}</p>
                  </div>

                  {selectedItem.contact && (
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>Kontak:</h4>
                      <p style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Phone size={14} style={{ color: "var(--primary)" }} />
                        {selectedItem.contact}
                      </p>
                    </div>
                  )}

                  {selectedItem.classification && (
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>Klasifikasi & Kamar:</h4>
                      <p style={{ fontSize: "0.85rem" }}>{selectedItem.classification} ({selectedItem.rooms} Kamar)</p>
                    </div>
                  )}

                  {selectedItem.food_type && (
                    <div>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>Kapasitas Restoran:</h4>
                      <p style={{ fontSize: "0.85rem" }}>{selectedItem.food_type} ({selectedItem.capacity} Kursi)</p>
                    </div>
                  )}
                </div>

                {selectedItem.facilities && selectedItem.facilities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>Fasilitas & Amenitas:</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {selectedItem.facilities.map((fac, i) => (
                        <span key={i} style={{
                          fontSize: "0.75rem",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-secondary)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border)"
                        }}>
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.map_link && (
                  <a
                    href={selectedItem.map_link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
                  >
                    <ExternalLink size={16} />
                    Navigasi Google Maps
                  </a>
                )}
              </div>
            ) : (
              // Standard Items List View
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--bg-primary)", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                  <span>MENAMPILKAN DESTINASI</span>
                  <span>{displayItems.length} Lokasi</span>
                </div>
                {displayItems.map(item => {
                  const catColor = categories.find(c => c.name === item.category)?.color;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.name}</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.address || `Kec. ${item.kecamatan}`}</p>
                      <span style={{
                        alignSelf: "flex-start",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: catColor,
                        textTransform: "uppercase",
                        marginTop: "0.25rem",
                        letterSpacing: "0.02em"
                      }}>
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Map Area */}
        <div style={{ flex: 1, height: "100%", position: "relative" }} className="map-frame">
          <MapComponent
            items={displayItems}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .map-page-wrapper {
            height: calc(100vh - 80px) !important;
          }
          .map-content-split {
            flex-direction: column-reverse !important;
          }
          .map-sidebar {
            width: 100% !important;
            height: 250px !important;
            border-right: none !important;
            border-top: 1px solid var(--border);
          }
          .map-frame {
            flex: 1 !important;
          }
          .mobile-map-header {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-map-header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PetaPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <p>Memuat Peta Wisata...</p>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
