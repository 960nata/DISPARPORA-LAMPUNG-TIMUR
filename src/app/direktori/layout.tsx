import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Direktori Destinasi Wisata | DISPARPORA Lampung Timur",
  description: "Temukan destinasi wisata alam, buatan, budaya, hotel penginapan, dan kuliner terbaik di seluruh kecamatan Kabupaten Lampung Timur.",
  openGraph: {
    title: "Direktori Destinasi — DISPARPORA Lampung Timur",
    description: "70+ destinasi wisata, akomodasi, dan kuliner di Lampung Timur. Temukan, filter, dan rencanakan perjalanan Anda.",
    url: "https://disparpora.lampungtimurkab.go.id/direktori",
    siteName: "DISPARPORA Lampung Timur",
    locale: "id_ID",
    type: "website",
  },
};

export default function DirektoriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
