import { createClient } from "@supabase/supabase-js";

// Server client for public reads only (rating averages). It never signs anyone
// in, so it does not touch cookies and no session is stored.
export function getServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
