import { NextResponse } from "next/server";
import { getMuseums, insertMuseum, type Museum } from "@/lib/museums";
import { resolveNearbyPlaces } from "@/lib/nearbyPlaces";
import { dbErrorMessage } from "@/lib/db";
import { isValidCoordinate } from "@/lib/geo";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — see the identical comment on
// every other /api/admin/* route for why this matters.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getMuseums());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Museum | null;
  if (!body || !body.id || !body.slug || !body.name) {
    return NextResponse.json({ error: "ID, slug, and name are required." }, { status: 400 });
  }

  const museums = await getMuseums();
  if (museums.some((m) => m.id === body.id)) {
    return NextResponse.json({ error: "A museum with this ID already exists." }, { status: 400 });
  }
  if (museums.some((m) => m.slug === body.slug)) {
    return NextResponse.json({ error: "A museum with this URL slug already exists." }, { status: 400 });
  }

  // Resolve Nearby Attractions once, right now, from the coordinates this
  // museum is being created with — never on a later page load. Best-effort:
  // if every OSM mirror is briefly unreachable this shouldn't block creating
  // the museum, it just leaves the list empty until the admin uses "Re-check
  // now" (see the museum's own nearby-places route) or edits the
  // coordinates, which re-triggers this same resolution.
  let nearbyPlaces: Museum["nearbyPlaces"] = [];
  let nearbyPlacesResolvedAt = "";
  if (isValidCoordinate(body.lat, body.lng)) {
    try {
      nearbyPlaces = await resolveNearbyPlaces({ lat: body.lat, lng: body.lng, name: body.name });
      nearbyPlacesResolvedAt = new Date().toISOString();
    } catch {
      // leave nearbyPlaces empty — see comment above
    }
  }

  try {
    await insertMuseum({ ...body, nearbyPlaces, nearbyPlacesResolvedAt });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: body.id });
}
