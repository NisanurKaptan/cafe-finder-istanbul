import data from "@/data/cafes.json";

export const dataGeneratedAt = data.generatedAt;

export function getCafesByDistrict(slug) {
  return data.cafes.filter((cafe) => cafe.district === slug);
}

export function countCafes(slug) {
  return getCafesByDistrict(slug).length;
}

export function osmUrl(cafe) {
  return `https://www.openstreetmap.org/${cafe.osmType}/${cafe.osmId}`;
}

export function directionsUrl(cafe) {
  return `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lon}`;
}

export function websiteUrl(cafe) {
  if (!cafe.website) return null;
  return /^https?:\/\//.test(cafe.website) ? cafe.website : `https://${cafe.website}`;
}
