import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service-role key server-side if available, fall back to publishable key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Server-side Supabase client (used inside API routes).
 * For Storage uploads we need at minimum the publishable key + a public bucket.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/** Bucket name where user-uploaded files are stored. */
export const STORAGE_BUCKET = "uploads";
