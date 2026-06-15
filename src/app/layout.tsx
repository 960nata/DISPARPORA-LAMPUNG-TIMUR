import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dinas Pariwisata, Pemuda dan Olahraga Kabupaten Lampung Timur",
  description: "Portal resmi Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur. Informasi destinasi wisata alam, buatan, budaya, akomodasi, dan kuliner.",
  icons: {
    icon: "/logo.avif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

