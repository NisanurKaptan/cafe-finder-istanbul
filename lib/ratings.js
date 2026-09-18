import { getServerSupabaseClient } from "@/lib/supabase/server";

// Average stars and vote count per cafe, read on the server from the public
// view. Ratings are a bonus on top of the OSM data: if Supabase is down or not
// configured yet, the page still renders with an empty list.
export async function getRatingStats() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("cafe_rating_stats")
    .select("cafe_id, rating_avg, rating_count");

  if (error) {
    console.error("Could not read cafe_rating_stats:", error.message);
    return [];
  }
  return data;
}
