import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, resolveAndPersistNearbyPlaces } from "@/lib/museums";
import type { NearbyPlace } from "@/lib/nearbyPlaces";
import { isValidCoordinate } from "@/lib/geo";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

// Manual "Re-check now" — the ONLY way, besides creating a museum or
// changing its coordinates, that Nearby Attractions ever gets recomputed.
// It re-runs the exact same automatic OpenStreetMap resolution — name,
// category, and mode are never admin-influenced — but any photo the admin
// has set on a place that's still found is carried forward (see
// resolveAndPersistNearbyPlaces), so this can't silently wipe out a chosen
// photo. Persists the result immediately, so the admin and the public page
// read the same updated list right after this returns.
//
// Optional body: `{ currentPlaces }` — the admin form's CURRENT (possibly
// unsaved) places, used as the merge basis instead of the last-saved DB
// row. Without this, clicking "Re-check now" right after editing a photo
// but before clicking Save would merge against the old DB copy and discard
// that unsaved edit; NearbyPlacesPanel always sends this.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  if (!isValidCoordinate(museum.lat, museum.lng)) {
    return NextResponse.json({ error: "This museum needs a real latitude/longitude before Nearby Attractions can be resolved." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { currentPlaces?: NearbyPlace[] } | null;
  const previousPlaces = Array.isArray(body?.currentPlaces) ? body!.currentPlaces! : museum.nearbyPlaces;

  try {
    const { places, resolvedAt } = await resolveAndPersistNearbyPlaces(
      museum.id,
      museum.lat,
      museum.lng,
      museum.name,
      previousPlaces
    );
    revalidatePath(`/${museum.slug}`);
    return NextResponse.json({ places, resolvedAt });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}
