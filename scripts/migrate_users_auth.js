/**
 * One-off migration to fix login + encrypt passwords on the users table.
 *
 * 1. Adds an `email` column (used by login) if missing.
 * 2. Backfills the email for known accounts (emails are not secrets).
 * 3. Bcrypt-hashes every still-plaintext password IN PLACE — the existing
 *    password VALUE is preserved, just stored as a hash. No passwords are
 *    hardcoded in this file.
 * 4. Adds a unique index on lower(email).
 *
 * After this runs, all passwords are bcrypt hashes ($2...) — never plaintext.
 *
 * Run:  node scripts/migrate_users_auth.js
 */
const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const ROUNDS = 12;

// username -> email (public, non-secret). Passwords are NOT touched by value.
const EMAILS = {
  superadmin: "superadmin@disparpora.lampungtimurkab.go.id",
  admindinas: "admindinas@disparpora.lampungtimurkab.go.id",
  adminpost:  "adminpost@disparpora.lampungtimurkab.go.id",
  dicky:      "dickyhadinata57@gmail.com",
};

(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await c.connect();

  // 1. email column
  await c.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text`);

  // 2. backfill emails (only where missing, so existing values are respected)
  for (const [username, email] of Object.entries(EMAILS)) {
    await c.query(
      `UPDATE public.users SET email = $1 WHERE username = $2 AND (email IS NULL OR email = '')`,
      [email, username]
    );
  }

  // 3. hash every still-plaintext password in place (value preserved)
  const plain = await c.query(`SELECT id, username, password FROM public.users WHERE password NOT LIKE '$2%'`);
  for (const row of plain.rows) {
    const hash = await bcrypt.hash(row.password, ROUNDS);
    await c.query(`UPDATE public.users SET password = $1 WHERE id = $2`, [hash, row.id]);
  }
  console.log(`Hashed ${plain.rows.length} plaintext password(s): ${plain.rows.map(r => r.username).join(", ") || "(none)"}`);

  // 4. unique index on email (partial: ignore NULLs)
  await c.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON public.users (lower(email)) WHERE email IS NOT NULL`);

  const res = await c.query(`SELECT username, email, left(password, 4) AS pw_prefix, length(password) AS pw_len FROM public.users ORDER BY username`);
  console.table(res.rows);
  await c.end();
  console.log("Migration done. All passwords are bcrypt hashes ($2...).");
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
