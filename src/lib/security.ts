import { rawQuery, rawExec, hasSqlDb } from "@/lib/db";

/**
 * Security event log — a DEFENSIVE audit trail so a superadmin can see attacks
 * against the site (brute-force logins, rate-limit blocks, unauthorized access,
 * and scanner/hacker probes like /.env, /wp-admin, /.git) together with the
 * attacker's approximate location (from edge geo headers).
 *
 * This only RECORDS and DISPLAYS activity — it never attacks anyone. Data lives
 * in `security_events` (auto-created; see scripts/migrate_security_events.js).
 * Unlike page-view analytics, we DO keep the source IP here — it is needed to
 * identify and block an attacker.
 */

export type SecurityEventType =
  | "login_failed"
  | "login_rate_limited"
  | "unauthorized"
  | "suspicious_request";

export interface SecurityEventInput {
  type: SecurityEventType;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  path?: string | null;
  method?: string | null;
  userAgent?: string | null;
  detail?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface SecurityEventRow {
  id: string;
  createdAt: string;
  type: string;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  path: string | null;
  method: string | null;
  userAgent: string | null;
  detail: string | null;
  lat: number | null;
  lng: number | null;
}

export interface SecuritySummary {
  total24h: number;
  total7d: number;
  byType24h: Record<string, number>;
  topCountries: { country: string; count: number }[];
  topIps: { ip: string; count: number }[];
}

const EMPTY_SUMMARY: SecuritySummary = {
  total24h: 0,
  total7d: 0,
  byType24h: {},
  topCountries: [],
  topIps: [],
};

const cap = (v: unknown, n: number): string | null =>
  typeof v === "string" && v.trim() ? v.slice(0, n) : null;

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

let tableEnsured = false;

async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  await rawExec(
    `CREATE TABLE IF NOT EXISTS public.security_events (
       id         bigserial PRIMARY KEY,
       created_at timestamptz NOT NULL DEFAULT now(),
       type       text NOT NULL,
       ip         text,
       country    text,
       region     text,
       city       text,
       path       text,
       method     text,
       user_agent text,
       detail     text,
       lat        double precision,
       lng        double precision
     )`
  );
  // Idempotent guards in case an older revision created the table without coords.
  await rawExec(`ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS lat double precision`);
  await rawExec(`ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS lng double precision`);
  await rawExec(
    `CREATE INDEX IF NOT EXISTS security_events_created_idx ON public.security_events (created_at DESC)`
  );
  await rawExec(
    `CREATE INDEX IF NOT EXISTS security_events_type_idx ON public.security_events (type)`
  );
  tableEnsured = true;
}

/**
 * Record one security event. Fire-and-forget safe: it NEVER throws, so callers
 * on hot paths (login, middleware) can log without risking the request.
 */
export async function logSecurityEvent(evt: SecurityEventInput): Promise<void> {
  if (!hasSqlDb) return;
  try {
    await ensureTable();
    await rawExec(
      `INSERT INTO public.security_events
         (type, ip, country, region, city, path, method, user_agent, detail, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      evt.type,
      cap(evt.ip, 64),
      cap(evt.country, 8),
      cap(evt.region, 80),
      cap(evt.city, 80),
      cap(evt.path, 300),
      cap(evt.method, 10),
      cap(evt.userAgent, 300),
      cap(evt.detail, 300),
      num(evt.lat),
      num(evt.lng)
    );
    await maybeNotify(evt);
  } catch {
    // Logging must never break the request it is observing.
  }
}

// ── Email alerts ────────────────────────────────────────────────────────────
// Sends an email when attacks are detected. Disabled unless RESEND_API_KEY is
// set, and throttled so a burst of probes can't flood the inbox.
const NOTIFY_COOLDOWN_MS = 10 * 60 * 1000;
let lastNotifyAt = 0;
let pendingSinceNotify = 0;

async function maybeNotify(evt: SecurityEventInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // email alerts off until an email provider is configured

  pendingSinceNotify++;
  const now = Date.now();
  if (now - lastNotifyAt < NOTIFY_COOLDOWN_MS) return; // still cooling down
  const count = pendingSinceNotify;
  lastNotifyAt = now;
  pendingSinceNotify = 0;

  const to = process.env.SECURITY_ALERT_TO || "dickyhadinata57@gmail.com";
  const from = process.env.SECURITY_ALERT_FROM || "SIMAD Security <onboarding@resend.dev>";
  const location = [evt.city, evt.region, evt.country].filter(Boolean).join(", ") || "tidak diketahui";

  const subject = `⚠️ Peringatan Keamanan SIMAD — ${count} aktivitas mencurigakan`;
  const text =
    `Terdeteksi aktivitas mencurigakan pada situs DISPARPORA Lampung Timur.\n\n` +
    `Jenis (terakhir) : ${evt.type}\n` +
    `IP               : ${evt.ip ?? "-"}\n` +
    `Lokasi           : ${location}\n` +
    `Path             : ${evt.path ?? "-"}\n` +
    `Detail           : ${evt.detail ?? "-"}\n` +
    `Waktu            : ${new Date().toISOString()}\n\n` +
    `Total dalam ~10 menit terakhir: ${count} kejadian.\n` +
    `Buka dashboard keamanan: /dashboard/keamanan`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
  } catch {
    // Never let a failed email break request handling.
  }
}

/** Most recent events (newest first). Returns [] on any error. */
export async function getSecurityEvents(limit = 150): Promise<SecurityEventRow[]> {
  if (!hasSqlDb) return [];
  try {
    await ensureTable();
    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 150, 1), 500);
    const rows = await rawQuery<any>(
      `SELECT id, created_at, type, ip, country, region, city, path, method, user_agent, detail, lat, lng
         FROM public.security_events
        ORDER BY created_at DESC
        LIMIT $1`,
      safeLimit
    );
    return rows.map((r) => ({
      id: String(r.id),
      createdAt: new Date(r.created_at).toISOString(),
      type: r.type,
      ip: r.ip ?? null,
      country: r.country ?? null,
      region: r.region ?? null,
      city: r.city ?? null,
      path: r.path ?? null,
      method: r.method ?? null,
      userAgent: r.user_agent ?? null,
      detail: r.detail ?? null,
      lat: r.lat === null || r.lat === undefined ? null : Number(r.lat),
      lng: r.lng === null || r.lng === undefined ? null : Number(r.lng),
    }));
  } catch {
    return [];
  }
}

/** Aggregated counts for the dashboard header. Returns zeros on any error. */
export async function getSecuritySummary(): Promise<SecuritySummary> {
  if (!hasSqlDb) return EMPTY_SUMMARY;
  try {
    await ensureTable();
    const [c24, c7d, byType, countries, ips] = await Promise.all([
      rawQuery<any>(
        `SELECT count(*)::int AS c FROM public.security_events WHERE created_at > now() - interval '24 hours'`
      ),
      rawQuery<any>(
        `SELECT count(*)::int AS c FROM public.security_events WHERE created_at > now() - interval '7 days'`
      ),
      rawQuery<any>(
        `SELECT type, count(*)::int AS c FROM public.security_events
           WHERE created_at > now() - interval '24 hours' GROUP BY type`
      ),
      rawQuery<any>(
        `SELECT country, count(*)::int AS c FROM public.security_events
           WHERE created_at > now() - interval '7 days' AND country IS NOT NULL AND country <> ''
           GROUP BY country ORDER BY c DESC LIMIT 8`
      ),
      rawQuery<any>(
        `SELECT ip, count(*)::int AS c FROM public.security_events
           WHERE created_at > now() - interval '7 days' AND ip IS NOT NULL AND ip <> ''
           GROUP BY ip ORDER BY c DESC LIMIT 8`
      ),
    ]);

    const byType24h: Record<string, number> = {};
    for (const r of byType) byType24h[r.type] = r.c;

    return {
      total24h: c24[0]?.c ?? 0,
      total7d: c7d[0]?.c ?? 0,
      byType24h,
      topCountries: countries.map((r: any) => ({ country: r.country, count: r.c })),
      topIps: ips.map((r: any) => ({ ip: r.ip, count: r.c })),
    };
  } catch {
    return EMPTY_SUMMARY;
  }
}
