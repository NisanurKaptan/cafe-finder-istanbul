"use client";

import { createClient } from "@supabase/supabase-js";

// Browser client. Keeps the anonymous session in localStorage so a visitor
// keeps the same user id (and their ratings) across visits.
let client;

export function getSupabaseClient() {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return client;
}

// Ratings need the `authenticated` role, which anonymous sign-in provides.
export async function signInAnonymously() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signedIn.session;
}
