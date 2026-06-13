"use client";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

interface PartnersSectionProps {
  partners?: Partner[];
}

const defaultPartners: Partner[] = [
  { id: "part_1", name: "Kemenparekraf RI", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
  { id: "part_2", name: "Taman Nasional Way Kambas", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
  { id: "part_3", name: "Bank Lampung", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
  { id: "part_4", name: "Pokdarwis Lampung Timur", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
  { id: "part_5", name: "Pemerintah Provinsi Lampung", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" }
];

export default function PartnersSection({ partners = [] }: PartnersSectionProps) {
  const activePartners = partners.length > 0 ? partners : defaultPartners;
  const doubledPartners = [...activePartners, ...activePartners, ...activePartners];

  return (
    <section style={{ marginTop: "-2rem", backgroundColor: "white", padding: "1rem 0" }}>
      <div className="marquee-container">
        <div className="marquee-content">
          {doubledPartners.map((p, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img
                src={p.logoUrl}
                alt={p.name}
                style={{ height: "40px", width: "40px", objectFit: "contain", filter: "grayscale(100%)", opacity: 0.6 }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
