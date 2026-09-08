"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import DeleteButton from "./DeleteButton";

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
  return (
    <div className="space-y-3">
      {museums.map((m) => (
        <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
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
