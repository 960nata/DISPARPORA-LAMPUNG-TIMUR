import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import Analytics from "@/components/Analytics";
import { SITE_URL, SITE_NAME, SITE_SHORT } from "@/lib/site";

const GA_ID = "G-J2PL8ZK042";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Portal resmi Dinas Pariwisata, Pemuda, dan Olahraga (DISPARPORA) Kabupaten Lampung Timur. Jelajahi destinasi wisata alam, bahari, budaya, sejarah, kuliner, akomodasi, agenda event, serta program kepemudaan dan olahraga daerah.";

export const metadata: Metadata = {
  // Resolves relative URLs (Open Graph, canonical, icons) against the real domain.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Portal Wisata Resmi`,
    template: `%s | ${SITE_SHORT}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Dinas Pariwisata Lampung Timur",
    "DISPARPORA Lampung Timur",
    "wisata Lampung Timur",
    "pariwisata Lampung Timur",
    "destinasi wisata Lampung Timur",
    "Taman Nasional Way Kambas",
    "pantai Lampung Timur",
    "wisata budaya Lampung",
    "kuliner Lampung Timur",
    "pemuda dan olahraga Lampung Timur",
    "Kabupaten Lampung Timur",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: "Pemerintah Kabupaten Lampung Timur",
  category: "government",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Portal Wisata Resmi`,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Portal Wisata Resmi`,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Set GOOGLE_SITE_VERIFICATION in env after adding the property in Search Console.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// Structured data: tells Google this is an official government tourism body,
// enabling a rich knowledge panel & sitelinks search box.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: SITE_NAME,
  alternateName: SITE_SHORT,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/og-image.png`,
  description: DESCRIPTION,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Kabupaten Lampung Timur",
  },
  parentOrganization: {
    "@type": "GovernmentOrganization",
    name: "Pemerintah Kabupaten Lampung Timur",
  },
  address: {
    "@type": "PostalAddress",
    addressRegion: "Lampung",
    addressCountry: "ID",
    addressLocality: "Sukadana",
  },
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <ConditionalLayout>{children}</ConditionalLayout>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}

