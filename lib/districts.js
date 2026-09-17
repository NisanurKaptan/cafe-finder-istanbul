// Districts covered by the app. `osmName` must match the OSM administrative
// boundary name (admin_level=6 for Istanbul districts).
export const districts = [
  { slug: "kadikoy", name: "Kadıköy", osmName: "Kadıköy", center: [40.9903, 29.0277] },
  { slug: "besiktas", name: "Beşiktaş", osmName: "Beşiktaş", center: [41.0422, 29.0067] },
  { slug: "uskudar", name: "Üsküdar", osmName: "Üsküdar", center: [41.0227, 29.0152] },
];

export function getDistrict(slug) {
  return districts.find((district) => district.slug === slug);
}
