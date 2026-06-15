import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak & Informasi | DISPARPORA Lampung Timur",
  description: "Hubungi Dinas Pariwisata, Kepemudaan dan Olahraga Kabupaten Lampung Timur. Alamat, telepon, email, dan jam operasional kantor.",
  openGraph: {
    title: "Kontak — DISPARPORA Lampung Timur",
    description: "Informasi kontak resmi DISPARPORA Lampung Timur: alamat, telepon, email, dan jam operasional.",
    url: "https://disparpora.lampungtimurkab.go.id/kontak",
    siteName: "DISPARPORA Lampung Timur",
    locale: "id_ID",
    type: "website",
  },
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
