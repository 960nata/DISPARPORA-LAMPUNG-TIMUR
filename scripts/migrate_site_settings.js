/**
 * One-off migration for the "Status Situs" (maintenance/suspend) feature.
 *
 * Creates the single-row `site_settings` table used by the suspend switch
 * (src/lib/siteStatus.ts + /dashboard/situs). Safe to run multiple times.
 *
 * Run locally against the (shared) Supabase database so the table already
 * exists in production — hosting does not need to create anything:
 *
 *   node scripts/migrate_site_settings.js
 *
 * The DDL here is identical to the auto-create in src/lib/siteStatus.ts, so
 * running this is optional (the app self-heals), but it lets you prepare the
 * table ahead of the deploy.
 */
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await c.connect();

  await c.query(`
    CREATE TABLE IF NOT EXISTS public.site_settings (
      id         integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      suspended  boolean NOT NULL DEFAULT false,
      message    text    NOT NULL DEFAULT '',
      due_date   date,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await c.query(`INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

  const res = await c.query(`SELECT id, suspended, message, due_date, updated_at FROM public.site_settings ORDER BY id`);
  console.table(res.rows);
  await c.end();
  console.log("Migration done. Table public.site_settings is ready.");
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
