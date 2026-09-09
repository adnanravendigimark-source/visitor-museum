import type { Museum } from "./museums";

// This file powers the "Other Attractions in {city}" cross-sell section —
// other bookable ticket pages on this site, in the SAME city only. It is
// intentionally simple: no distance math, no cross-city backfill, no
// randomness. If a city only has one museum in the CMS so far, this
// section has nothing to show and the component hides itself — that's
// correct, not a bug, and it self-resolves the moment a second attraction
// is added for that city through the admin.
//
// Real-world "what's physically nearby this museum" (which may include
// places that aren't on this site at all) is a separate concern, handled
// by lib/nearbyPlaces.ts via a live lat/lng lookup against OpenStreetMap.
const MAX_RESULTS = 3;

export interface SameCityAttraction {
  museum: Museum;
}

/**
 * Other museums/attractions in the exact same city as `current`, sourced
 * only from this site's own CMS data — every result is a real bookable
 * ticket page. No other city is ever substituted in.
 */
export function getSameCityAttractions(current: Museum, allMuseums: Museum[]): SameCityAttraction[] {
  return allMuseums
    .filter((m) => m.id !== current.id)
    .filter((m) => m.city && m.city === current.city)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name))
    .slice(0, MAX_RESULTS)
    .map((museum) => ({ museum }));
}

export function otherAttractionsHeading(current: Museum): string {
  if (current.nearbyHeadingOverride?.trim()) return current.nearbyHeadingOverride.trim();
  return `Other Attractions in ${current.city}`;
}
