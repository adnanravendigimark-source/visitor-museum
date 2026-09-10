"use client";

import { useState } from "react";
import { useToast } from "./Toast";

// Bulk backfill for museums that predate the Nearby Attractions feature (or
// whose coordinates have never changed since) — those only ever get a
// resolved list from a deliberate trigger (creation, a coordinate change,
// or this action), never automatically. This just calls the same
// per-museum "Re-check now" endpoint for every museum in turn — it doesn't
// let the admin influence what comes back, only that it's (re)computed.
// A small concurrency limit keeps this from hammering the free OSM mirrors
// while still being faster than doing it one museum at a time by hand.
const CONCURRENCY = 3;

export default function RecheckAllNearbyButton({ museumIds }: { museumIds: string[] }) {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);

  async function handleClick() {
    if (!museumIds.length) return;
    if (
      !window.confirm(
        `Re-check Nearby Attractions for all ${museumIds.length} museum${museumIds.length === 1 ? "" : "s"}? This can take a few minutes.`
      )
    ) {
      return;
    }

    setRunning(true);
    setDone(0);
    let succeeded = 0;
    let failed = 0;

    const queue = [...museumIds];
    async function worker() {
      while (queue.length) {
        const id = queue.shift();
        if (!id) return;
        try {
          const res = await fetch(`/api/admin/museums/${id}/nearby-places`, { method: "POST" });
          if (res.ok) succeeded += 1;
          else failed += 1;
        } catch {
          failed += 1;
        }
        setDone((d) => d + 1);
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, museumIds.length) }, () => worker()));

    setRunning(false);
    showToast(
      failed ? "error" : "success",
      failed
        ? `Re-checked ${succeeded} of ${museumIds.length} — ${failed} couldn't reach OpenStreetMap this time, try again shortly.`
        : `Re-checked Nearby Attractions for all ${succeeded} museums.`
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={running || !museumIds.length}
      className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
    >
      {running ? `Re-checking… (${done}/${museumIds.length})` : "Re-check all Nearby Attractions"}
    </button>
  );
}
