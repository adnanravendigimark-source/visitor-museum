import type { Museum } from "@/lib/museums";
import NearbyAttractionsClient from "./NearbyAttractionsClient";

// Nearby Attractions is resolved once (on museum creation, a coordinate
// change, or an admin "Re-check now") and persisted on the museum row —
// see lib/museums.ts's Museum.nearbyPlaces comment and
// resolveAndPersistNearbyPlaces. This component just renders whatever's
// stored there; it never calls OpenStreetMap/Wikipedia itself, so the list
// is identical on every page load and identical to what the admin sees,
// instead of being re-discovered (and potentially changing) on every visit.
export default function NearbyAttractions({ museum }: { museum: Museum }) {
  const places = museum.nearbyPlaces || [];

  // Genuinely nothing tagged nearby on OpenStreetMap within range — stay
  // hidden rather than making something up.
  if (!places.length) return null;

  return <NearbyAttractionsClient currentMuseumName={museum.name} places={places} />;
}
