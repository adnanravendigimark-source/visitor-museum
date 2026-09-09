import { getMuseums, getMuseumBySlug } from "../lib/museums.js";
import { getSameCityAttractions, otherAttractionsHeading } from "../lib/nearby.js";
import { getNearbyPlaces } from "../lib/nearbyPlaces.js";

async function test() {
  const louvre = await getMuseumBySlug("louvre-museum-tickets-tour");
  if (!louvre) {
    console.error("Louvre not found!");
    return;
  }
  const allMuseums = await getMuseums();

  console.log(`Testing "Other Attractions in ${louvre.city}" for ${louvre.name}...`);
  console.log(`Heading: ${otherAttractionsHeading(louvre)}`);
  const sameCity = getSameCityAttractions(louvre, allMuseums);
  console.log(`Found ${sameCity.length} same-city attractions:`);
  for (const item of sameCity) {
    console.log(`- ${item.museum.name} (${item.museum.city})`);
  }

  console.log(`\nTesting real Nearby Attractions (OpenStreetMap) for ${louvre.name}...`);
  const nearby = await getNearbyPlaces({ lat: louvre.lat, lng: louvre.lng, name: louvre.name });
  console.log(`Found ${nearby.length} nearby places:`);
  for (const place of nearby) {
    console.log(`- ${place.name} (${place.category}): mode=${place.mode}`);
  }
}

test().catch(console.error);
