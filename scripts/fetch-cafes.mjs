// Fetches cafes from the Overpass API and writes data/cafes.json.
// Usage: npm run fetch-data
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { districts } from "../lib/districts.js";
import { scoreCafe } from "../lib/score.js";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const USER_AGENT = "cafe-finder-istanbul (github.com project)";
const OUTPUT = new URL("../data/cafes.json", import.meta.url);

// Rough Istanbul bounding box, guards against same-named areas elsewhere.
const ISTANBUL_BBOX = { minLat: 40.8, maxLat: 41.4, minLon: 28.0, maxLon: 29.9 };

// A district whose cafe count drops below this share of the previous run is
// treated as a bad Overpass response.
const MIN_KEEP_RATIO = 0.5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildQuery(osmName) {
  return `[out:json][timeout:90];
area["name"="${osmName}"]["boundary"="administrative"]["admin_level"="6"]->.a;
nwr["amenity"="cafe"](area.a);
out center tags;`;
}

async function runQuery(query) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const endpoint of ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ data: query }),
        });
        const text = await response.text();
        if (!response.ok || !text.startsWith("{")) {
          throw new Error(`${endpoint} returned ${response.status}`);
        }
        return JSON.parse(text);
      } catch (error) {
        lastError = error;
        console.warn(`  retrying: ${error.message}`);
        await sleep(5000 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

const isYes = (value) => value === "yes";

function normalize(element, district) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const cafe = {
    id: `${element.type[0]}${element.id}`,
    osmType: element.type,
    osmId: element.id,
    name: tags.name,
    district: district.slug,
    lat,
    lon,
    address: street || null,
    neighbourhood: tags["addr:neighbourhood"] ?? tags["addr:suburb"] ?? null,
    openingHours: tags.opening_hours ?? null,
    wifi: ["wlan", "yes", "wifi"].includes(tags.internet_access),
    outdoorSeating: isYes(tags.outdoor_seating),
    wheelchair: isYes(tags.wheelchair),
    vegan: isYes(tags["diet:vegan"]) || tags["diet:vegan"] === "only",
    takeaway: isYes(tags.takeaway),
    website: tags.website ?? tags["contact:website"] ?? null,
    instagram: tags["contact:instagram"] ?? null,
    brand: tags.brand ?? null,
    cuisine: tags.cuisine ?? null,
  };
  cafe.score = scoreCafe(cafe);
  return cafe;
}

async function readPreviousCafes() {
  try {
    const data = JSON.parse(await readFile(OUTPUT, "utf8"));
    return data.cafes ?? [];
  } catch {
    return [];
  }
}

function inIstanbul({ lat, lon }) {
  return (
    lat >= ISTANBUL_BBOX.minLat &&
    lat <= ISTANBUL_BBOX.maxLat &&
    lon >= ISTANBUL_BBOX.minLon &&
    lon <= ISTANBUL_BBOX.maxLon
  );
}

async function main() {
  const cafes = [];

  for (const district of districts) {
    console.log(`Fetching ${district.name}...`);
    const data = await runQuery(buildQuery(district.osmName));
    const districtCafes = data.elements
      .filter((element) => element.tags?.name)
      .map((element) => normalize(element, district))
      .filter(inIstanbul);
    console.log(`  ${districtCafes.length} named cafes`);
    cafes.push(...districtCafes);
    await sleep(3000);
  }

  cafes.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"));

  // Overpass sometimes answers with an empty or partial result instead of an
  // error. Never let that overwrite good data.
  const previous = await readPreviousCafes();
  for (const district of districts) {
    const before = previous.filter((cafe) => cafe.district === district.slug).length;
    const after = cafes.filter((cafe) => cafe.district === district.slug).length;
    if (after === 0 || after < before * MIN_KEEP_RATIO) {
      throw new Error(
        `${district.name}: got ${after} cafes, had ${before}. Keeping existing data/cafes.json.`,
      );
    }
  }

  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(
    OUTPUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), cafes }, null, 2) + "\n",
  );
  console.log(`Wrote ${cafes.length} cafes to data/cafes.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
