"use client";

import { useEffect, useState } from "react";

// One row per image ever uploaded through the admin — shape returned by
// GET /api/admin/media (see lib/media.ts's MediaItem, plus `usedIn` added by
// the route from lib/mediaUsage.ts).
type MediaItem = {
  id: number;
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  usedIn: string[];
};

// The "choose a previously uploaded image" half of every image picker in
// the admin. Nothing here ever deletes anything — it's a pure read+select
// UI over the permanent media_library table, so any image ever uploaded or
// pasted (via ImageUploadField or RichImageModal, on any page) can be
// found and reused here instead of re-uploaded.
export default function MediaLibraryModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the media library.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-stone-900">Media Library</h3>
            <p className="mt-0.5 text-sm text-stone-500">
              Every image ever uploaded or used on the site — click one to reuse it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {items === null && !error && <p className="py-10 text-center text-sm text-stone-400">Loading…</p>}
          {error && <p className="py-10 text-center text-sm text-red-600">{error}</p>}
          {items && items.length === 0 && (
            <p className="py-10 text-center text-sm text-stone-400">
              No images uploaded yet — upload one and it&apos;ll show up here for reuse next time.
            </p>
          )}
          {items && items.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => {
                const used = item.usedIn && item.usedIn.length > 0;
                const usageLabel = used
                  ? item.usedIn.length === 1
                    ? item.usedIn[0]
                    : `${item.usedIn[0]} +${item.usedIn.length - 1} more`
                  : "Unused";
                const tooltip = `${item.filename || item.url}\n${
                  used ? `Used in: ${item.usedIn.join(", ")}` : "Not currently used anywhere on the site"
                }`;
                return (
                  <div key={item.id} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onSelect(item.url)}
                      title={tooltip}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100 transition hover:border-canal-blue hover:ring-2 hover:ring-canal-blue/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      <span
                        className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white ${
                          used ? "bg-green-500" : "bg-stone-300"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-900">
                          Select
                        </span>
                      </span>
                    </button>
                    <span
                      className={`truncate text-[10px] ${used ? "text-green-700" : "text-stone-400"}`}
                      title={tooltip}
                    >
                      {usageLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
