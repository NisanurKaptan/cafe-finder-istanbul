"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

// A district page renders hundreds of cards. If every card asked for its own
// rating there would be hundreds of parallel requests, which the browser
// refuses (ERR_INSUFFICIENT_RESOURCES). So the visitor's ratings are read once
// per page load and shared by all cards.
let pending;

export function getMyRatings() {
  pending ??= loadMyRatings();
  return pending;
}

async function loadMyRatings() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();

  // Nobody is signed in until they actually vote, so there is nothing to read.
  if (!data.session) return new Map();

  const { data: rows, error } = await supabase
    .from("ratings")
    .select("cafe_id, stars")
    .eq("user_id", data.session.user.id);

  if (error) return new Map();
  return new Map(rows.map((row) => [row.cafe_id, row.stars]));
}

// Keeps the shared map in step with a vote the visitor just gave.
export async function rememberMyRating(cafeId, stars) {
  const ratings = await getMyRatings();
  ratings.set(cafeId, stars);
}
