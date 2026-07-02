/**
 * Safe, idempotent athletes seeder — fills the empty `athletes` table on
 * Supabase WITHOUT touching any other table (unlike prisma/seed.ts which is
 * destructive). Upserts by id, so running it twice is harmless.
 *
 * Run:  node scripts/seed-athletes.mjs
 */
import { Client } from "pg";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const cs = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!cs) { console.error("No DATABASE_URL/DIRECT_URL"); process.exit(1); }

const athletes = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/data/db_store.json"), "utf-8")
).athletes || [];

const c = new Client({ connectionString: cs });
await c.connect();

let n = 0;
for (const a of athletes) {
  await c.query(
    `INSERT INTO public.athletes (id, nama, cabor, juara, event)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE
       SET nama = EXCLUDED.nama, cabor = EXCLUDED.cabor,
           juara = EXCLUDED.juara, event = EXCLUDED.event`,
    [a.id, a.nama, a.cabor, a.juara, a.event]
  );
  n++;
}

const { rows } = await c.query(`SELECT count(*)::int AS total FROM public.athletes`);
console.log(`✅ Upserted ${n} athletes; table now has ${rows[0].total} rows.`);
await c.end();
