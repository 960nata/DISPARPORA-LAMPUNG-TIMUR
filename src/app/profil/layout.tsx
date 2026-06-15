import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Dinas | DISPARPORA Lampung Timur",
  description: "Profil resmi Dinas Pariwisata, Kepemudaan dan Olahraga Kabupaten Lampung Timur. Visi, misi, struktur organisasi, tupoksi, dan program kerja.",
  openGraph: {
    title: "Profil Dinas — DISPARPORA Lampung Timur",
    description: "Visi, misi, struktur organisasi, dan program kerja DISPARPORA Kabupaten Lampung Timur.",
    url: "https://disparpora.lampungtimurkab.go.id/profil",
    siteName: "DISPARPORA Lampung Timur",
    locale: "id_ID",
    type: "website",
  },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
