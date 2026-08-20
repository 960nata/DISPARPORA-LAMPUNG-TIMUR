/**
 * One-off migration for the security monitoring feature.
 *
 * Creates the `security_events` table used by the security dashboard
 * (src/lib/security.ts + /dashboard/keamanan). Safe to run multiple times.
 *
 * Run locally against the (shared) Supabase database:
 *
 *   node scripts/migrate_security_events.js
 *
 * The DDL matches the auto-create in src/lib/security.ts, so running this is
 * optional (the app self-heals) — it just prepares the table before deploy.
 */
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await c.connect();

  await c.query(`
    CREATE TABLE IF NOT EXISTS public.security_events (
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
    )
  `);
  await c.query(`ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS lat double precision`);
  await c.query(`ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS lng double precision`);
  await c.query(`CREATE INDEX IF NOT EXISTS security_events_created_idx ON public.security_events (created_at DESC)`);
  await c.query(`CREATE INDEX IF NOT EXISTS security_events_type_idx ON public.security_events (type)`);

  // IP blocklist (manual from dashboard, or auto after repeated probes).
  await c.query(`
    CREATE TABLE IF NOT EXISTS public.blocked_ips (
      ip         text PRIMARY KEY,
      reason     text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz
    )
  `);

  const res = await c.query(`SELECT count(*)::int AS total FROM public.security_events`);
  const blk = await c.query(`SELECT count(*)::int AS blocked FROM public.blocked_ips`);
  console.table([{ ...res.rows[0], ...blk.rows[0] }]);
  await c.end();
  console.log("Migration done. Tables public.security_events + public.blocked_ips are ready.");
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
