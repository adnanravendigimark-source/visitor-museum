import type { Museum } from "./museums";
import { haversineDistanceKm, isValidCoordinate } from "./geo";
import { getRoutingInfo } from "./routing";

const WALK_RADIUS_KM = 3;
const DRIVE_RADIUS_KM = 10;
// Straight-line pre-filter buffer: real walking/driving routes are always
// longer than the straight-line distance, so we cast a slightly wider net
// before calling the routing API, then apply the real ~3km / ~10km cutoffs
// against the actual routed distance.
const PREFILTER_RADIUS_KM = DRIVE_RADIUS_KM * 1.6;
const MAX_ROUTING_CANDIDATES = 8;
const MAX_RESULTS = 6;

export type NearbyMode = "walk" | "drive";

export interface NearbyAttraction {
  museum: Museum;
  mode: NearbyMode;
  distanceKm: number;
  durationMinutes: number;
}

/**
 * Finds other museums/attractions near `current`, purely from lat/lng data —
 * no hardcoded distances or attraction relationships. Works for any city or
 * country added through the CMS: as soon as a museum has valid coordinates,
 * it becomes eligible to appear here for any other museum within range, and
 * vice versa.
 */
export async function getNearbyMuseums(
  current: Museum,
  allMuseums: Museum[]
): Promise<NearbyAttraction[]> {
  if (!isValidCoordinate(current.lat, current.lng)) return [];

  const candidates = allMuseums
    .filter((m) => m.id !== current.id)
    .filter((m) => isValidCoordinate(m.lat, m.lng))
    .map((m) => ({ museum: m, straightLineKm: haversineDistanceKm(current.lat, current.lng, m.lat, m.lng) }))
    .filter((c) => c.straightLineKm <= PREFILTER_RADIUS_KM)
    .sort((a, b) => a.straightLineKm - b.straightLineKm)
    .slice(0, MAX_ROUTING_CANDIDATES);

  if (!candidates.length) return [];

  const results = await Promise.all(
    candidates.map(async ({ museum, straightLineKm }): Promise<NearbyAttraction | null> => {
      const from = { lat: current.lat, lng: current.lng };
      const to = { lat: museum.lat, lng: museum.lng };

      // Only bother with a walking-route lookup for candidates that are
      // plausibly within walking range in the first place.
      if (straightLineKm <= WALK_RADIUS_KM * 1.4) {
        const walk = await getRoutingInfo("walk", from, to);
        if (walk.distanceKm <= WALK_RADIUS_KM) {
          return { museum, mode: "walk", distanceKm: walk.distanceKm, durationMinutes: walk.durationMinutes };
        }
      }

      const drive = await getRoutingInfo("drive", from, to);
      if (drive.distanceKm <= DRIVE_RADIUS_KM) {
        return { museum, mode: "drive", distanceKm: drive.distanceKm, durationMinutes: drive.durationMinutes };
      }

      return null;
    })
  );

  return results
    .filter((r): r is NearbyAttraction => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);
}

export function nearbyHeading(current: Museum): string {
  if (current.nearbyHeadingOverride?.trim()) return current.nearbyHeadingOverride.trim();
  return `Other Attractions in ${current.city}`;
}
