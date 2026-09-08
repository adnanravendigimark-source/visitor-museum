"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import DeleteButton from "./DeleteButton";
import { useToast } from "./Toast";

interface MuseumSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  cardImage: string;
  cardImageAlt: string;
  featured: boolean;
}

export default function MuseumsReorderList({
  museums,
  isAdmin,
}: {
  museums: MuseumSummary[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState(museums);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next: MuseumSummary[]) {
    setOrder(next);
    setSaving(true);
    const res = await fetch("/api/admin/museums/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((m) => m.id) }),
    });
    setSaving(false);
    if (!res.ok) {
      showToast("error", "Couldn't save the new order. Please try again.");
      setOrder(museums);
      return;
    }
    router.refresh();
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  return (
    <div className="space-y-3">
      {saving && <p className="text-xs text-stone-500">Saving order…</p>}
      {order.map((m, i) => (
        <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="rounded border border-stone-300 px-1.5 text-xs text-stone-600 transition hover:bg-stone-100 disabled:opacity-30"
              aria-label="Move up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === order.length - 1}
              className="rounded border border-stone-300 px-1.5 text-xs text-stone-600 transition hover:bg-stone-100 disabled:opacity-30"
              aria-label="Move down"
            >
              ▼
            </button>
          </div>
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <SafeImage src={m.cardImage} alt={m.cardImageAlt} fill sizes="80px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-stone-900">
              {m.name} {m.featured && <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">Featured</span>}
            </p>
            <p className="text-sm text-stone-500">
              {m.city}, {m.country} · /{m.slug}
            </p>
          </div>
          <Link href={`/admin/museums/${m.id}`} className="shrink-0 text-sm font-medium text-canal-blue hover:underline">
            Edit
          </Link>
          {isAdmin && (
            <DeleteButton
              url={`/api/admin/museums/${m.id}`}
              confirmMessage={`Delete "${m.name}"? This also removes all its tours and FAQs. This can't be undone.`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
