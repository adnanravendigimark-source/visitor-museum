import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { getMuseums, getAllTours } from "@/lib/museums";

export const dynamic = "force-dynamic";

export default async function AdminAllToursPage() {
  const [museums, allTours] = await Promise.all([getMuseums(), getAllTours()]);

  const countByMuseum = new Map<string, number>();
  for (const t of allTours) {
    countByMuseum.set(t.museumId, (countByMuseum.get(t.museumId) || 0) + 1);
  }

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/museums" className="font-medium text-canal-blue hover:underline">
          ← Back to Museums &amp; Attractions
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">Tours &amp; Tickets</h1>
      <p className="mt-1 text-sm text-stone-600">
        Pick a museum to see and edit its tickets — price, description, includes, image, and booking link.
      </p>

      <div className="mt-8 space-y-3">
        {museums.map((m) => {
          const count = countByMuseum.get(m.id) || 0;
          return (
            <Link
              key={m.id}
              href={`/admin/museums/${m.id}/tours`}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-canal-blue/40 hover:shadow-sm"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <SafeImage src={m.cardImage} alt={m.cardImageAlt} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{m.name}</p>
                <p className="text-sm text-stone-500">
                  {m.city}, {m.country}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  count > 0 ? "bg-sage-500/15 text-sage-700" : "bg-stone-100 text-stone-500"
                }`}
              >
                {count} {count === 1 ? "ticket" : "tickets"}
              </span>
              <span className="shrink-0 text-sm font-medium text-canal-blue">Manage →</span>
            </Link>
          );
        })}
        {museums.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No museums yet — add one first from Museums &amp; Attractions.
          </p>
        )}
      </div>
    </div>
  );
}
