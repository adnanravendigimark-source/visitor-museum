import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { searchCities } from "@/lib/geo";

export const dynamic = "force-dynamic";

// City/country autocomplete for the Tours & Tickets admin form's City
// field (see components/admin/CityAutocomplete.tsx). Requires *some* valid
// admin session — there's no per-section data behind this endpoint, only
// the shared city/country search itself, so it isn't gated by the
// "museums" PageKey the way /api/admin/museums/* is.
//
// A 2-character minimum avoids a full dataset scan (and an unhelpfully
// huge dropdown) on every keystroke from an empty field — the client also
// debounces its own requests, so this is defense in depth, not the only
// thing limiting request volume.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchCities(q, 10);
  return NextResponse.json({ results });
}
