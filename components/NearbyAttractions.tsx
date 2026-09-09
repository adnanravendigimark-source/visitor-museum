import type { Museum } from "@/lib/museums";
import { getNearbyPlaces } from "@/lib/nearbyPlaces";
import NearbyAttractionsClient from "./NearbyAttractionsClient";

export default async function NearbyAttractions({ museum }: { museum: Museum }) {
  const places = await getNearbyPlaces({ lat: museum.lat, lng: museum.lng, name: museum.name });

  // Genuinely nothing tagged nearby on OpenStreetMap within range — stay
  // hidden rather than making something up.
  if (!places.length) return null;

  return <NearbyAttractionsClient currentMuseumName={museum.name} places={places} />;
}
