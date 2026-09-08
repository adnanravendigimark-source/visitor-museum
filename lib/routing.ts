import { haversineDistanceKm } from "./geo";

// Free, keyless routing via the OSRM (Open Source Routing Machine) project.
// Base URL is configurable via OSRM_BASE_URL so a self-hosted OSRM instance
// (which can serve the "foot" profile) can be swapped in later without any
// code changes — never hardcode the endpoint. The public demo server at
// router.project-osrm.org only serves the "driving" profile, so for walking
// we fall back to an estimate derived from straight-line distance (average
// walking speed with a street-detour factor) when the "foot" profile isn't
// available. This keeps the walking/driving distinction genuinely useful
// without requiring any paid API key or billing account.
const OSRM_BASE_URL = (process.env.OSRM_BASE_URL || "https://router.project-osrm.org").replace(/\/+$/, "");

const AVG_WALK_SPEED_KMH = 4.8;
const STREET_DETOUR_FACTOR = 1.3; // real walking routes are rarely a straight line

export type TravelMode = "walk" | "drive";

export interface RoutingResult {
  distanceKm: number;
  durationMinutes: number;
  source: "osrm" | "estimated";
}

async function fetchOsrmRoute(
  profile: "foot" | "driving",
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ distanceKm: number; durationMinutes: number } | null> {
  try {
    const url = `${OSRM_BASE_URL}/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route || typeof route.distance !== "number" || typeof route.duration !== "number") return null;
    return {
      distanceKm: route.distance / 1000,
      durationMinutes: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

function estimateWalking(distanceKm: number): RoutingResult {
  const routeDistanceKm = distanceKm * STREET_DETOUR_FACTOR;
  return {
    distanceKm: routeDistanceKm,
    durationMinutes: Math.max(1, Math.round((routeDistanceKm / AVG_WALK_SPEED_KMH) * 60)),
    source: "estimated",
  };
}

export async function getRoutingInfo(
  mode: TravelMode,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RoutingResult> {
  const straightLineKm = haversineDistanceKm(from.lat, from.lng, to.lat, to.lng);

  if (mode === "walk") {
    // Only attempt OSRM's "foot" profile if a custom (non public-demo) base
    // URL is configured, since the free public demo server doesn't serve it.
    if (process.env.OSRM_BASE_URL) {
      const result = await fetchOsrmRoute("foot", from.lat, from.lng, to.lat, to.lng);
      if (result) return { ...result, source: "osrm" };
    }
    return estimateWalking(straightLineKm);
  }

  const result = await fetchOsrmRoute("driving", from.lat, from.lng, to.lat, to.lng);
  if (result) return { ...result, source: "osrm" };

  // Graceful fallback if OSRM is briefly unreachable: rough estimate at a
  // typical urban driving speed.
  const AVG_DRIVE_SPEED_KMH = 30;
  const routeDistanceKm = straightLineKm * 1.4;
  return {
    distanceKm: routeDistanceKm,
    durationMinutes: Math.max(1, Math.round((routeDistanceKm / AVG_DRIVE_SPEED_KMH) * 60)),
    source: "estimated",
  };
}
