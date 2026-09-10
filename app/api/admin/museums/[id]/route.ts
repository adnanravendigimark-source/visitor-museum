import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, getMuseums, updateMuseum, deleteMuseum, mergeNearbyPlaceImages, type Museum } from "@/lib/museums";
import { resolveNearbyPlaces } from "@/lib/nearbyPlaces";
import { getSession } from "@/lib/session";
import { dbErrorMessage } from "@/lib/db";
import { isValidCoordinate } from "@/lib/geo";

// Treat two coordinates as "the same place" below this threshold (~1cm at
// the equator) so floating-point round-tripping through a number input
// never triggers a needless re-resolution — only a real, intentional
// coordinate change does.
const COORD_EPSILON = 0.0000001;

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(museum);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => null)) as Museum | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const existing = await getMuseumById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.slug !== existing.slug) {
    const museums = await getMuseums();
    if (museums.some((m) => m.id !== params.id && m.slug === body.slug)) {
      return NextResponse.json({ error: "A museum with this URL slug already exists." }, { status: 400 });
    }
  }

  // Nearby Attractions is resolved once and persisted (see
  // lib/museums.ts's Museum.nearbyPlaces comment) — a normal save just
  // carries the existing resolved list through unchanged. The ONE thing
  // that invalidates it is the museum's own coordinates actually moving:
  // that's a genuinely different real-world location, so its Nearby
  // Attractions get re-resolved from OpenStreetMap right here, the same
  // way they are on first creation. Nothing else about a save (headings,
  // pricing, images, etc.) ever touches this list.
  let nearbyPlaces = body.nearbyPlaces ?? existing.nearbyPlaces;
  let nearbyPlacesResolvedAt = body.nearbyPlacesResolvedAt ?? existing.nearbyPlacesResolvedAt;
  const coordsChanged =
    Math.abs((body.lat ?? existing.lat) - existing.lat) > COORD_EPSILON ||
    Math.abs((body.lng ?? existing.lng) - existing.lng) > COORD_EPSILON;
  if (coordsChanged && isValidCoordinate(body.lat, body.lng)) {
    try {
      const fresh = await resolveNearbyPlaces({ lat: body.lat, lng: body.lng, name: body.name || existing.name });
      nearbyPlaces = mergeNearbyPlaceImages(fresh, nearbyPlaces);
      nearbyPlacesResolvedAt = new Date().toISOString();
    } catch {
      // Every mirror failed on this attempt — leave the previous list in
      // place rather than wiping it out; the admin's "Re-check now" action
      // can retry later, and the next real coordinate change tries again too.
    }
  }

  try {
    await updateMuseum(params.id, { ...body, id: params.id, nearbyPlaces, nearbyPlacesResolvedAt });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  // The old slug's page and the museums grid both need to reflect the
  // change immediately — belt-and-suspenders on top of force-dynamic +
  // no-store, same reasoning as every other content-saving route.
  revalidatePath(`/${existing.slug}`);
  if (body.slug !== existing.slug) revalidatePath(`/${body.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete." }, { status: 403 });
  }

  const existing = await getMuseumById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await deleteMuseum(params.id);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${existing.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
