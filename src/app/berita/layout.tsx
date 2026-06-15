import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Berita Pariwisata | DISPARPORA Lampung Timur",
  description: "Ikuti liputan terkini seputar agenda pariwisata, event budaya, destinasi unggulan, kepemudaan dan olahraga Kabupaten Lampung Timur.",
  openGraph: {
    title: "Portal Berita Pariwisata — DISPARPORA Lampung Timur",
    description: "Berita resmi seputar pariwisata, event budaya, dan potensi wisata Kabupaten Lampung Timur.",
    url: "https://disparpora.lampungtimurkab.go.id/berita",
    siteName: "DISPARPORA Lampung Timur",
    locale: "id_ID",
    type: "website",
  },
};

export default function BeritaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
