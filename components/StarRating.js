"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, signInAnonymously } from "@/lib/supabase/client";
import { getMyRatings, rememberMyRating } from "@/lib/my-ratings";
import styles from "./StarRating.module.css";

const STARS = [1, 2, 3, 4, 5];

// Shows the average rating and lets the visitor give their own. The average is
// updated in place after a vote, so the visitor sees the effect without waiting
// for the page to be rebuilt.
export default function StarRating({ cafeId, ratingAvg = 0, ratingCount = 0 }) {
  const [average, setAverage] = useState({ avg: ratingAvg, count: ratingCount });
  const [myStars, setMyStars] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [status, setStatus] = useState("idle");

  // The visitor's own ratings are loaded once per page and shared by all cards.
  useEffect(() => {
    let active = true;

    getMyRatings().then((ratings) => {
      const stars = ratings.get(cafeId);
      if (active && stars) setMyStars(stars);
    });

    return () => {
      active = false;
    };
  }, [cafeId]);

  async function rate(stars) {
    if (status === "saving") return;
    const previous = myStars;
    setMyStars(stars);
    setStatus("saving");

    try {
      const session = await signInAnonymously();
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("ratings")
        .upsert(
          { cafe_id: cafeId, user_id: session.user.id, stars },
          { onConflict: "cafe_id,user_id" },
        );
      if (error) throw error;

      await rememberMyRating(cafeId, stars);
      setAverage((current) => nextAverage(current, previous, stars));
      setStatus("saved");
    } catch {
      setMyStars(previous);
      setStatus("error");
    }
  }

  const shown = hovered ?? myStars ?? Math.round(average.avg);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.stars}
        role="radiogroup"
        aria-label="Bu cafeye puan ver"
        onMouseLeave={() => setHovered(null)}
      >
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={myStars === star}
            aria-label={`${star} yıldız`}
            className={star <= shown ? styles.starOn : styles.star}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => rate(star)}
            disabled={status === "saving"}
          >
            ★
          </button>
        ))}
      </div>

      <p className={styles.summary}>
        {average.count > 0
          ? `${average.avg.toFixed(1)} · ${average.count} oy`
          : "Henüz oy yok"}
        {myStars && status !== "error" && <span className={styles.mine}> · senin oyun: {myStars}</span>}
        {status === "error" && <span className={styles.error}> · oy kaydedilemedi</span>}
      </p>
    </div>
  );
}

// Recalculates the shown average locally: a first vote adds to the count, a
// changed vote only replaces the old stars.
function nextAverage({ avg, count }, previous, stars) {
  const total = avg * count;
  if (previous) {
    return { avg: (total - previous + stars) / count, count };
  }
  return { avg: (total + stars) / (count + 1), count: count + 1 };
}
