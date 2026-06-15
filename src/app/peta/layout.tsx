import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peta Wisata Interaktif | DISPARPORA Lampung Timur",
  description: "Jelajahi peta interaktif destinasi wisata, akomodasi, dan kuliner di seluruh Kabupaten Lampung Timur dengan filter kategori dan pencarian.",
  openGraph: {
    title: "Peta Wisata Interaktif — DISPARPORA Lampung Timur",
    description: "Temukan lokasi destinasi wisata, hotel, dan kuliner di Lampung Timur lewat peta interaktif.",
    url: "https://disparpora.lampungtimurkab.go.id/peta",
    siteName: "DISPARPORA Lampung Timur",
    locale: "id_ID",
    type: "website",
  },
};

export default function PetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
