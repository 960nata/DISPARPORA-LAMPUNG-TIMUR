import type { NextConfig } from "next";

// Supabase project origin, derived from env so the CSP never drifts per environment.
// Falls back to the wildcard-covered value if unset.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Modern referrer policy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  // Enable HSTS in production (1 year)
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  // Content Security Policy
  // - default: self only
  // - scripts: self + Vercel live feedback + Google Fonts/Maps + blob: (Leaflet marker workers)
  // - styles: self + Google Fonts + inline (needed for JSX-in-JS styles)
  // - images: self + Supabase Storage + OpenStreetMap tiles (MapComponent) + data URIs (previews)
  // - connect: self + Supabase API (DB + Storage)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' blob: https://maps.googleapis.com https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob: https://*.supabase.co ${supabaseOrigin} https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://images.unsplash.com https://disparpora.lampungtimurkab.go.id https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
      "media-src 'self'",
      `connect-src 'self' https://*.supabase.co ${supabaseOrigin} https://www.google-analytics.com https://*.google-analytics.com`,
      // maps.google.com + www.google.com: /kontak Google Maps embed (redirects across both)
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://maps.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it Next infers the parent
  // directory (which also contains a package-lock.json) as root, which can break
  // the dev server / route resolution.
  turbopack: { root: __dirname },

  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
