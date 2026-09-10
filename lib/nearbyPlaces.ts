import { haversineDistanceKm, isValidCoordinate } from "./geo";
import { getRoutingInfo } from "./routing";

// Real "what's physically near this museum" lookup — genuinely nearby
// points of interest pulled from OpenStreetMap's Overpass API, keyed off
// the museum's own lat/lng. Nothing here is hardcoded, randomized, or
// editable by hand: if there's genuinely nothing tagged nearby, a museum
// just has fewer (or no) Nearby Attractions cards.
//
// IMPORTANT — this file is a RESOLVER, not a per-request data source.
// resolveNearbyPlaces() below is only ever called from a deliberate admin
// action (creating a museum, changing its coordinates, or an explicit
// "re-check" in the admin) — see resolveAndPersistNearbyPlaces() in
// lib/museums.ts. The result is stored on the museum row (nearby_places_json)
// and both the admin and the public page just read that stored value —
// neither one calls Overpass, OSRM, or any image API on every page load or
// API request. This is deliberate: those free public services were being
// hit on every visit, which was slow, and — because a handful of Overpass
// mirrors were raced against each other and could each return a slightly
// different result — made the visible list flicker between requests.
// Resolving once and persisting removes both problems: the list a museum
// shows is exactly what it showed the last time someone (a save, a
// coordinate change, or a manual re-check) resolved it, on both admin and
// public pages, until one of those things happens again.
const OVERPASS_USER_AGENT = "VisitMuseums/1.0 (+https://visit-museums.com; nearby-attractions feature)";

// One canonical radius, reused for every mirror. The old version varied the
// radius per mirror so "whichever mirror answers first" could return a
// meaningfully different search area — that was one of the two sources of
// randomness this resolver exists to eliminate (the other being running
// mirrors as a race instead of a fixed sequence — see resolveCandidates).
const SEARCH_RADIUS_M = 6000;
const MIRROR_TIMEOUT_MS = 6000;

function buildMirrorList(): string[] {
  const custom = process.env.OVERPASS_API_URL?.replace(/\/+$/, "");
  const mirrors: string[] = [];
  if (custom) mirrors.push(custom);
  // Fixed order, always the same — this list is never shuffled or raced.
  mirrors.push(
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter"
  );
  return mirrors;
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
  imageUrl?: string;
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
    // GET with the query as a `data` param (not POST) so this is a normal
    // cacheable request. Since resolution now only happens on a deliberate
    // admin action rather than every page load, this cache is mostly just a
    // courtesy to the free public mirrors if the same museum gets resolved
    // twice in quick succession (e.g. a retry).
    const getUrl = `${url}?data=${encodeURIComponent(query)}`;
    return await fetch(getUrl, {
      headers: { "User-Agent": OVERPASS_USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 60 * 60 },
    });
  } catch {
    return null;
  }
}

async function tryMirror(lat: number, lng: number, url: string): Promise<{ elements: RawElement[]; ok: boolean }> {
  const query = buildQuery(lat, lng, SEARCH_RADIUS_M);
  let res = await fetchOverpassOnce(url, query, MIRROR_TIMEOUT_MS);

  // A single short retry rides out a transient 429 from a mirror that's
  // otherwise responsive, without burning much extra time on it.
  if (res && res.status === 429) {
    await new Promise((r) => setTimeout(r, 1200));
    res = await fetchOverpassOnce(url, query, MIRROR_TIMEOUT_MS);
  }

  if (!res || !res.ok) return { elements: [], ok: false };
  try {
    const data = await res.json();
    return { elements: Array.isArray(data?.elements) ? data.elements : [], ok: true };
  } catch {
    return { elements: [], ok: false };
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
        // A real place is often tagged with a direct photo, a Wikimedia
        // Commons reference, or a Wikipedia/Wikidata cross-reference — used
        // below, in that order of specificity, to pull a genuine photo
        // rather than faking one. See getPlaceImage.
        image: el.tags?.image,
        wikimediaCommons: el.tags?.wikimedia_commons,
        wikipedia: el.tags?.wikipedia,
        wikidata: el.tags?.wikidata,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    // A single real place can be tagged on both a node and its containing
    // way (e.g. a museum building + its entrance point) — dedupe by name.
    .filter((c, i, arr) => arr.findIndex((o) => o.name === c.name) === i)
    .filter((c) => c.name.trim().toLowerCase() !== current.name.trim().toLowerCase())
    .sort((a, b) => a.straightLineKm - b.straightLineKm);
}

// Tries each mirror in the SAME fixed order every time — never raced, never
// shuffled — and stops at the first one that returns real candidates. If a
// mirror answers successfully but with zero results (which, in testing,
// some mirrors do even for genuinely POI-dense areas — likely a stale or
// partial regional extract) this keeps trying the rest before accepting
// "nothing found" as the final answer, rather than trusting the first
// technically-OK-but-empty response. Because this always walks the mirrors
// in the same order against the same single radius, the SAME museum
// resolved twice in a row (with no real-world OSM changes in between) gets
// the SAME result — the nondeterminism the old per-request version had is
// gone. Any change now only ever comes from OSM's real data changing, or
// from this being re-run later.
async function resolveCandidates(
  current: { lat: number; lng: number; name: string }
): Promise<{ candidates: ReturnType<typeof toCandidates>; anyMirrorSucceeded: boolean }> {
  const mirrors = buildMirrorList();
  let anyMirrorSucceeded = false;

  for (const url of mirrors) {
    const { elements, ok } = await tryMirror(current.lat, current.lng, url);
    if (ok) anyMirrorSucceeded = true;
    const candidates = toCandidates(elements, current);
    if (candidates.length > 0) return { candidates, anyMirrorSucceeded };
  }

  return { candidates: [], anyMirrorSucceeded };
}

async function getRoutedResults(
  current: { lat: number; lng: number; name: string },
  candidatesIn: ReturnType<typeof toCandidates>
): Promise<NearbyPlace[]> {
  const candidates = candidatesIn.slice(0, MAX_ROUTING_CANDIDATES);
  if (!candidates.length) return [];

  // Photo lookups only need each candidate's tags, already known before
  // routing runs — kicking these off now, in parallel with the routing
  // calls below, avoids a second sequential network round trip. A handful
  // of these end up unused (for candidates that don't make the final top
  // 3), which is a fair trade since this whole resolution only happens
  // occasionally now, not on every page load.
  const imagePromises = new Map(
    candidates.map((c) => [c.id, getPlaceImage({ image: c.image, wikimediaCommons: c.wikimediaCommons, wikipedia: c.wikipedia, wikidata: c.wikidata })])
  );

  const routed = await Promise.all(
    candidates.map(async (c): Promise<(NearbyPlace & { distanceKm: number }) | null> => {
      const from = { lat: current.lat, lng: current.lng };
      const to = { lat: c.lat, lng: c.lng };
      const base = { id: c.id, name: c.name, category: c.category, icon: c.icon };

      if (c.straightLineKm <= WALK_RADIUS_KM * 1.4) {
        const walk = await getRoutingInfo("walk", from, to);
        if (walk.distanceKm <= WALK_RADIUS_KM) {
          return { ...base, mode: "walk", distanceKm: walk.distanceKm };
        }
      }

      const drive = await getRoutingInfo("drive", from, to);
      if (drive.distanceKm <= DRIVE_RADIUS_KM) {
        return { ...base, mode: "drive", distanceKm: drive.distanceKm };
      }

      return null;
    })
  );

  const top = routed
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);

  const withImages = await Promise.all(
    top.map(async ({ distanceKm, ...place }) => ({
      ...place,
      imageUrl: await (imagePromises.get(place.id) ?? Promise.resolve(undefined)),
    }))
  );

  return withImages;
}

/**
 * Resolves the real nearby tourist attractions around `current`'s
 * coordinates, pulled from OpenStreetMap — never this site's own museum
 * list, and never padded with unrelated or hardcoded entries. Classified as
 * walk/drive using the same real routed-distance logic as the rest of the
 * site, with a genuine photo per place when one exists.
 *
 * Call this ONLY from a deliberate resolve point (new museum, changed
 * coordinates, or an explicit admin re-check — see
 * resolveAndPersistNearbyPlaces in lib/museums.ts) and persist the result.
 * Never call this on a page render or from a per-request API route — that
 * was the previous design, and it's exactly what made the list slow to
 * load and inconsistent between requests.
 */
export async function resolveNearbyPlaces(current: { lat: number; lng: number; name: string }): Promise<NearbyPlace[]> {
  if (!isValidCoordinate(current.lat, current.lng)) return [];

  const { candidates } = await resolveCandidates(current);
  return getRoutedResults(current, candidates);
}

/**
 * A genuine photo for a real place, preferring the most specific source
 * available: a direct `image` tag on the OSM element itself, then a
 * `wikimedia_commons` reference, then the place's Wikipedia article photo,
 * then its Wikidata P18 claim. All four are free/keyless. Returns undefined
 * (never a fake or placeholder photo) when nothing is found — the card
 * falls back to its icon tile.
 */
async function getPlaceImage(tags: { image?: string; wikimediaCommons?: string; wikipedia?: string; wikidata?: string }): Promise<string | undefined> {
  const fromCommonsFilename = (filename: string) =>
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename.replace(/^File:/i, ""))}?width=500`;

  // 1. A direct `image` tag — either already a full URL, or a bare Commons
  // filename/File: reference. This is the most specific source: it's a
  // photo someone attached to this exact OSM feature, not just its general
  // Wikipedia topic.
  if (tags.image) {
    const value = tags.image.trim();
    if (/^https?:\/\//i.test(value)) return value;
    if (/^(File:)?[^:]+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value)) return fromCommonsFilename(value);
  }

  // 2. `wikimedia_commons` — either a File: (use directly) or a Category:
  // (ask Commons for the category's first image file).
  if (tags.wikimediaCommons) {
    const value = tags.wikimediaCommons.trim();
    if (/^File:/i.test(value)) return fromCommonsFilename(value);
    if (/^Category:/i.test(value)) {
      try {
        const res = await fetch(
          `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(value)}&cmtype=file&cmlimit=1&format=json&origin=*`,
          { headers: { "User-Agent": OVERPASS_USER_AGENT }, signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const data = await res.json();
          const title = data?.query?.categorymembers?.[0]?.title;
          if (title) return fromCommonsFilename(title);
        }
      } catch {
        // fall through to the wikipedia/wikidata attempts below
      }
    }
  }

  // 3. The place's own Wikipedia article lead photo.
  if (tags.wikipedia) {
    const [lang, ...titleParts] = tags.wikipedia.split(":");
    const title = titleParts.join(":").trim();
    if (lang && title) {
      try {
        const res = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
          { headers: { "User-Agent": OVERPASS_USER_AGENT }, signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const data = await res.json();
          const url = data?.thumbnail?.source || data?.originalimage?.source;
          if (url) return url;
        }
      } catch {
        // fall through to the wikidata attempt below
      }
    }
  }

  // 4. Wikidata's P18 ("image") claim.
  if (tags.wikidata) {
    try {
      const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${tags.wikidata}.json`, {
        headers: { "User-Agent": OVERPASS_USER_AGENT },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const filename = data?.entities?.[tags.wikidata]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
        if (filename) return fromCommonsFilename(filename);
      }
    } catch {
      // no photo available — the card uses its icon tile instead
    }
  }

  return undefined;
}
