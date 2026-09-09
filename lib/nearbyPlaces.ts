import { haversineDistanceKm, isValidCoordinate } from "./geo";
import { getRoutingInfo } from "./routing";

// Real "what's physically near this museum" lookup — genuinely nearby
// points of interest pulled live from OpenStreetMap's Overpass API, keyed
// off the museum's own lat/lng. Nothing here is hardcoded or randomized:
// if every mirror genuinely has nothing tagged nearby, the section simply
// shows fewer cards (or none), rather than padding with unrelated data.
//
// Overpass is free and keyless (same "no billing account required"
// philosophy as the OSRM routing already used on this site). The free
// public mirrors are individually flaky — one can hang for 10s+ on a
// given request while another responds instantly, and it varies minute to
// minute, not by city — so instead of trusting a single endpoint this
// rotates through several, moving on immediately from one that errors,
// times out, or (like some regional mirrors) simply has no data for a
// given area, and stopping at the first one that returns real results.
// OVERPASS_API_URL can still override/prepend a self-hosted mirror.
const OVERPASS_USER_AGENT = "VisitMuseums/1.0 (+https://visit-museums.com; nearby-attractions feature)";

interface MirrorAttempt {
  url: string;
  radiusM: number;
  timeoutMs: number;
}

function buildAttempts(): MirrorAttempt[] {
  const custom = process.env.OVERPASS_API_URL?.replace(/\/+$/, "");
  const attempts: MirrorAttempt[] = [];
  if (custom) attempts.push({ url: custom, radiusM: 4000, timeoutMs: 9000 });
  attempts.push(
    { url: "https://overpass-api.de/api/interpreter", radiusM: 3000, timeoutMs: 8000 },
    { url: "https://overpass.kumi.systems/api/interpreter", radiusM: 3000, timeoutMs: 8000 },
    { url: "https://overpass-api.de/api/interpreter", radiusM: 6000, timeoutMs: 10000 },
    { url: "https://overpass.osm.ch/api/interpreter", radiusM: 8000, timeoutMs: 6000 }
  );
  return attempts;
}

const WALK_RADIUS_KM = 3;
const DRIVE_RADIUS_KM = 10;
const MAX_ROUTING_CANDIDATES = 6;
const MAX_RESULTS = 3;

export type PlaceMode = "walk" | "drive";

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  icon: string;
  mode: PlaceMode;
}

// OSM tag -> human label + icon. Only genuinely visitable attraction-type
// tags are queried in the first place (see buildQuery below), so this is
// just presentation, not filtering.
const TAG_LABELS: Record<string, { label: string; icon: string }> = {
  museum: { label: "Museum", icon: "🏛️" },
  gallery: { label: "Art Gallery", icon: "🖼️" },
  attraction: { label: "Attraction", icon: "🎟️" },
  viewpoint: { label: "Viewpoint", icon: "🌄" },
  artwork: { label: "Public Artwork", icon: "🗿" },
  zoo: { label: "Zoo", icon: "🦁" },
  theme_park: { label: "Theme Park", icon: "🎡" },
  aquarium: { label: "Aquarium", icon: "🐠" },
  monument: { label: "Monument", icon: "🗽" },
  castle: { label: "Castle", icon: "🏰" },
  memorial: { label: "Memorial", icon: "🕊️" },
  ruins: { label: "Historic Ruins", icon: "🏺" },
  archaeological_site: { label: "Archaeological Site", icon: "⛏️" },
  fort: { label: "Fort", icon: "🏯" },
  citadel: { label: "Citadel", icon: "🏯" },
  park: { label: "Park", icon: "🌳" },
};

interface RawElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildQuery(lat: number, lng: number, radiusM: number): string {
  const tourismTags = "attraction|museum|gallery|viewpoint|artwork|zoo|theme_park|aquarium";
  const historicTags = "monument|castle|memorial|ruins|archaeological_site|fort|citadel";
  const around = `around:${radiusM},${lat},${lng}`;
  // nwr (node+way+relation in one clause) instead of separate node/way
  // statements keeps the query cheap even in densely-tagged city centers.
  return `[out:json][timeout:20];(
    nwr["tourism"~"^(${tourismTags})$"](${around});
    nwr["historic"~"^(${historicTags})$"](${around});
  );out center 20;`;
}

function tagCategory(tags: Record<string, string>): { key: string; label: string; icon: string } | null {
  const tourism = tags.tourism;
  const historic = tags.historic;
  const key = (tourism && TAG_LABELS[tourism]) ? tourism : (historic && TAG_LABELS[historic]) ? historic : null;
  if (!key) return null;
  return { key, ...TAG_LABELS[key] };
}

async function fetchOverpassOnce(url: string, query: string, timeoutMs: number): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain", "User-Agent": OVERPASS_USER_AGENT },
      body: query,
      signal: AbortSignal.timeout(timeoutMs),
      // Real-world POIs near a fixed museum don't change often — cache for
      // a day so we're a good citizen of these free public instances.
      next: { revalidate: 60 * 60 * 24 },
    });
  } catch {
    return null;
  }
}

async function tryAttempt(lat: number, lng: number, attempt: MirrorAttempt): Promise<RawElement[]> {
  const query = buildQuery(lat, lng, attempt.radiusM);
  let res = await fetchOverpassOnce(attempt.url, query, attempt.timeoutMs);

  // A single short retry rides out a transient 429 from a mirror that's
  // otherwise responsive, without burning the whole time budget on it.
  if (res && res.status === 429) {
    await new Promise((r) => setTimeout(r, 1200));
    res = await fetchOverpassOnce(attempt.url, query, attempt.timeoutMs);
  }

  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data?.elements) ? data.elements : [];
  } catch {
    return [];
  }
}

function toCandidates(elements: RawElement[], current: { lat: number; lng: number; name: string }) {
  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      const name = el.tags?.name;
      if (!isValidCoordinate(lat, lon) || !name) return null;
      const category = tagCategory(el.tags || {});
      if (!category) return null;
      const straightLineKm = haversineDistanceKm(current.lat, current.lng, lat as number, lon as number);
      // Filters out the museum's own building being double-tagged, or an
      // adjoining node for the same complex.
      if (straightLineKm < 0.05) return null;
      return {
        id: `${el.type}/${el.id}`,
        name,
        lat: lat as number,
        lng: lon as number,
        straightLineKm,
        category: category.label,
        icon: category.icon,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    // A single real place can be tagged on both a node and its containing
    // way (e.g. a museum building + its entrance point) — dedupe by name.
    .filter((c, i, arr) => arr.findIndex((o) => o.name === c.name) === i)
    .filter((c) => c.name.trim().toLowerCase() !== current.name.trim().toLowerCase())
    .sort((a, b) => a.straightLineKm - b.straightLineKm);
}

/**
 * Real nearby tourist attractions around `current`'s coordinates, pulled
 * live from OpenStreetMap — not this site's own museum list, and never
 * padded with unrelated or hardcoded entries. Classified as walk/drive
 * using the same real routed-distance logic as the rest of the site.
 */
export async function getNearbyPlaces(current: {
  lat: number;
  lng: number;
  name: string;
}): Promise<NearbyPlace[]> {
  if (!isValidCoordinate(current.lat, current.lng)) return [];

  let candidates: ReturnType<typeof toCandidates> = [];
  for (const attempt of buildAttempts()) {
    const elements = await tryAttempt(current.lat, current.lng, attempt);
    const found = toCandidates(elements, current);
    if (found.length > 0) {
      candidates = found;
      break;
    }
  }

  candidates = candidates.slice(0, MAX_ROUTING_CANDIDATES);
  if (!candidates.length) return [];

  const routed = await Promise.all(
    candidates.map(async (c): Promise<(NearbyPlace & { distanceKm: number }) | null> => {
      const from = { lat: current.lat, lng: current.lng };
      const to = { lat: c.lat, lng: c.lng };

      if (c.straightLineKm <= WALK_RADIUS_KM * 1.4) {
        const walk = await getRoutingInfo("walk", from, to);
        if (walk.distanceKm <= WALK_RADIUS_KM) {
          return { id: c.id, name: c.name, category: c.category, icon: c.icon, mode: "walk", distanceKm: walk.distanceKm };
        }
      }

      const drive = await getRoutingInfo("drive", from, to);
      if (drive.distanceKm <= DRIVE_RADIUS_KM) {
        return { id: c.id, name: c.name, category: c.category, icon: c.icon, mode: "drive", distanceKm: drive.distanceKm };
      }

      return null;
    })
  );

  return routed
    .filter((r): r is NearbyPlace & { distanceKm: number } => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS)
    .map(({ distanceKm, ...place }) => place);
}
