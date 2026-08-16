import { rawQuery, rawExec, hasSqlDb } from "@/lib/db";

/**
 * Site suspension status — a transparent "maintenance mode" switch.
 *
 * When `suspended` is true, the public site shows an honest maintenance page
 * (see `middleware.ts` + `/maintenance`). The dashboard and API stay reachable,
 * so a logged-in superadmin can still work and flip the switch back off. This
 * is NOT a hidden backdoor: access is via the normal authenticated login.
 *
 * Source of truth is a single-row `site_settings` table in Postgres. When no
 * database is configured (local dev), it degrades to an in-memory value.
 */
export interface SiteStatus {
  suspended: boolean;
  /** Optional custom message shown on the maintenance page. */
  message: string;
  /** Optional annual-maintenance due date (YYYY-MM-DD) for the dashboard reminder. */
  dueDate: string | null;
}

const DEFAULT_STATUS: SiteStatus = { suspended: false, message: "", dueDate: null };

// In-memory fallback used only when there is no SQL database (dev without DATABASE_URL).
let memoryStatus: SiteStatus = { ...DEFAULT_STATUS };

let tableEnsured = false;

async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  await rawExec(
    `CREATE TABLE IF NOT EXISTS public.site_settings (
       id         integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
       suspended  boolean NOT NULL DEFAULT false,
       message    text    NOT NULL DEFAULT '',
       due_date   date,
       updated_at timestamptz NOT NULL DEFAULT now()
     )`
  );
  await rawExec(`INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
  tableEnsured = true;
}

function toDateString(value: any): string | null {
  if (!value) return null;
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

/**
 * Read the current site status. Never throws — on any error (or no DB) it
 * returns a not-suspended default so the public site "fails open" and stays up.
 */
export async function getSiteStatus(): Promise<SiteStatus> {
  if (!hasSqlDb) return { ...memoryStatus };
  try {
    await ensureTable();
    const rows = await rawQuery<any>(
      `SELECT suspended, message, due_date FROM public.site_settings WHERE id = 1 LIMIT 1`
    );
    const row = rows[0];
    if (!row) return { ...DEFAULT_STATUS };
    return {
      suspended: !!row.suspended,
      message: row.message ?? "",
      dueDate: toDateString(row.due_date),
    };
  } catch {
    // Fail open: if the flag can't be read, keep the site available.
    return { ...DEFAULT_STATUS };
  }
}

/** Update the site status (superadmin only — enforced at the API layer). */
export async function setSiteStatus(patch: Partial<SiteStatus>): Promise<SiteStatus> {
  const current = await getSiteStatus();
  const next: SiteStatus = {
    suspended: patch.suspended ?? current.suspended,
    message: patch.message ?? current.message,
    dueDate: patch.dueDate === undefined ? current.dueDate : patch.dueDate,
  };

  if (!hasSqlDb) {
    memoryStatus = { ...next };
    return { ...memoryStatus };
  }

  await ensureTable();
  await rawExec(
    `UPDATE public.site_settings
       SET suspended = $1, message = $2, due_date = $3, updated_at = now()
     WHERE id = 1`,
    next.suspended,
    next.message,
    next.dueDate
  );
  return next;
}
