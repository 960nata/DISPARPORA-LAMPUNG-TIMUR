import type { Metadata } from "next";
import { getSiteStatus } from "@/lib/siteStatus";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sedang Dalam Pemeliharaan",
  robots: { index: false, follow: false },
};

const DEFAULT_MESSAGE =
  "Situs sedang tidak aktif sementara untuk pemeliharaan terjadwal. Silakan kembali beberapa saat lagi. Terima kasih atas pengertiannya.";

export default async function MaintenancePage() {
  const status = await getSiteStatus();
  const message = status.message?.trim() || DEFAULT_MESSAGE;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(160deg, var(--bg-primary, #f8faf9) 0%, var(--bg-secondary, #eef3f1) 100%)",
        fontFamily: "var(--font-main, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          textAlign: "center",
          background: "var(--bg-primary, #ffffff)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "24px",
          padding: "48px 36px",
          boxShadow: "0 30px 60px -30px rgba(6,78,59,0.35)",
        }}
      >
        <img
          src="/logo.avif"
          alt=""
          width={64}
          height={64}
          style={{ objectFit: "contain", margin: "0 auto 22px", display: "block" }}
        />

        <div
          aria-hidden
          style={{
            width: "72px",
            height: "72px",
            margin: "0 auto 24px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0E9F4F, #065f46)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 14px 28px -14px rgba(14,159,79,0.7)",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 900,
            margin: "0 0 12px",
            color: "var(--text-primary, #0f1c17)",
            letterSpacing: "-0.02em",
          }}
        >
          Sedang Dalam Pemeliharaan
        </h1>

        <p
          style={{
            fontSize: "0.98rem",
            lineHeight: 1.7,
            color: "var(--text-secondary, #556)",
            margin: "0 0 24px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(14,159,79,0.1)",
            border: "1px solid rgba(14,159,79,0.25)",
            borderRadius: "99px",
            padding: "8px 16px",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#0E9F4F",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#0E9F4F",
              display: "inline-block",
            }}
          />
          {SITE_NAME}
        </div>
      </div>
    </div>
  );
}
