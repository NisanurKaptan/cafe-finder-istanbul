// OSM has no ratings, so cafes are ranked by how useful their known
// features are. Missing tags count as "unknown", not "no".
export const SCORE_WEIGHTS = {
  wifi: 3,
  outdoorSeating: 2,
  openingHours: 1,
  wheelchair: 1,
  website: 1,
  independent: 1,
};

export function scoreCafe(cafe) {
  let score = 0;
  if (cafe.wifi) score += SCORE_WEIGHTS.wifi;
  if (cafe.outdoorSeating) score += SCORE_WEIGHTS.outdoorSeating;
  if (cafe.openingHours) score += SCORE_WEIGHTS.openingHours;
  if (cafe.wheelchair) score += SCORE_WEIGHTS.wheelchair;
  if (cafe.website) score += SCORE_WEIGHTS.website;
  if (!cafe.brand) score += SCORE_WEIGHTS.independent;
  return score;
}

export const MAX_SCORE = Object.values(SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
