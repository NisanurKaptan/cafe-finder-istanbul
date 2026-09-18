// Ranking by Bayesian average. A cafe with one 5-star vote should not beat a
// cafe with forty 4.6-star votes, so every cafe starts with PRIOR_VOTES
// imaginary votes at the site-wide average. Real votes push the score away
// from that average as they come in.

// How many votes a cafe needs before its own rating really moves the list.
export const PRIOR_VOTES = 5;

// Used while no cafe has been rated yet.
export const DEFAULT_MEAN = 3.5;

// Average of the cafes that have ratings. Every rated cafe counts once, no
// matter how many votes it got: weighting by vote count would let one popular
// cafe pull the prior up to its own level, which then lifts single-vote cafes.
export function siteMean(stats) {
  const rated = stats.filter((stat) => stat.rating_count > 0);
  if (rated.length === 0) return DEFAULT_MEAN;

  const total = rated.reduce((sum, stat) => sum + stat.rating_avg, 0);
  return total / rated.length;
}

export function bayesianScore({ ratingAvg = 0, ratingCount = 0 }, mean) {
  return (PRIOR_VOTES * mean + ratingAvg * ratingCount) / (PRIOR_VOTES + ratingCount);
}

// Most cafes have no votes for now, so their Bayesian scores are identical.
// The OSM feature score (wifi, outdoor seating, independent) breaks those ties.
export function compareCafes(a, b) {
  return (
    b.ratingScore - a.ratingScore ||
    b.score - a.score ||
    a.name.localeCompare(b.name, "tr")
  );
}

// Merges cafes with their rating stats and returns them ranked.
export function rankCafes(cafes, stats) {
  const byId = new Map(stats.map((stat) => [stat.cafe_id, stat]));
  const mean = siteMean(stats);

  return cafes
    .map((cafe) => {
      const stat = byId.get(cafe.id);
      const ratingAvg = stat?.rating_avg ?? 0;
      const ratingCount = stat?.rating_count ?? 0;
      return {
        ...cafe,
        ratingAvg,
        ratingCount,
        ratingScore: bayesianScore({ ratingAvg, ratingCount }, mean),
      };
    })
    .sort(compareCafes);
}
