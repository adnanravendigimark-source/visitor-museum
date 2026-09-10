"use client";

import { useState } from "react";
import type { NearbyPlace } from "@/lib/nearbyPlaces";
import ImageUploadField from "./ImageUploadField";
import { useToast } from "./Toast";

// Display of a museum's persisted Nearby Attractions. Name, category, and
// mode are auto-generated from OpenStreetMap and can't be touched here —
// the ONE editable field per place is its photo, saved as part of this
// form same as any other field (click Save below to keep it).
//
// "Re-check now" re-runs the automatic OpenStreetMap resolution and
// persists immediately (it isn't gated by Save) — but it's safe to use
// even after setting custom photos: any place still found (matched by its
// stable OSM id) keeps whatever photo is currently set, auto or
// hand-picked, and only a genuinely new place gets an auto-detected one.
// See lib/museums.ts's mergeNearbyPlaceImages.
export default function NearbyPlacesPanel({
  museumId,
  places,
  resolvedAt,
  onImageChange,
  onRecheckComplete,
}: {
  museumId: string;
  places: NearbyPlace[];
  resolvedAt: string;
  onImageChange: (placeId: string, url: string) => void;
  onRecheckComplete: (places: NearbyPlace[], resolvedAt: string) => void;
}) {
  const { showToast } = useToast();
  const [checking, setChecking] = useState(false);

  async function handleRecheck() {
    setChecking(true);
    try {
      // Send the form's current places (which may include an unsaved photo
      // edit) as the merge basis, so re-checking right after editing a
      // photo — before clicking the main Save button — can't discard it.
      const res = await fetch(`/api/admin/museums/${museumId}/nearby-places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPlaces: places }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", data.error || "Couldn't re-check Nearby Attractions.");
        return;
      }
      onRecheckComplete(data.places || [], data.resolvedAt || "");
      showToast(
        "success",
        data.places?.length ? `Found ${data.places.length} nearby attraction${data.places.length === 1 ? "" : "s"}.` : "Checked — nothing tagged nearby on OpenStreetMap right now."
      );
    } catch {
      showToast("error", "Couldn't re-check Nearby Attractions.");
    } finally {
      setChecking(false);
    }
  }

  const resolvedLabel = resolvedAt
    ? new Date(resolvedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "never";

  return (
    <div className="rounded-xl border border-stone-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-stone-500">Last checked: {resolvedLabel}</p>
        <button
          type="button"
          onClick={handleRecheck}
          disabled={checking}
          className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
        >
          {checking ? "Checking…" : "Re-check now"}
        </button>
      </div>

      {places.length === 0 ? (
        <p className="mt-3 text-xs text-stone-500">
          Nothing resolved yet — this fills in automatically when the museum is saved with real coordinates, or you
          can trigger it now with "Re-check now" above.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {places.map((place) => (
            <div key={place.id} className="rounded-lg border border-stone-100 bg-stone-50 p-3">
              <div className="flex items-center gap-3">
                {place.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={place.imageUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-lg" aria-hidden="true">
                    {place.icon}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">{place.name}</p>
                  <p className="text-xs text-stone-500">
                    {place.category} · {place.mode === "walk" ? "Walking distance" : "Driving distance"}
                  </p>
                </div>
              </div>
              <div className="mt-2.5">
                <ImageUploadField
                  label="Photo"
                  value={place.imageUrl || ""}
                  onChange={(url) => onImageChange(place.id, url)}
                  aspectRatio={4 / 3}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-stone-400">Photo changes here are saved with the rest of this form — don't forget Save.</p>
        </div>
      )}
    </div>
  );
}
