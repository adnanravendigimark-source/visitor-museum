import Link from "next/link";
import { notFound } from "next/navigation";
import { getMuseumById, getToursRawByMuseum } from "@/lib/museums";
import { getSession } from "@/lib/session";
import DeleteButton from "@/components/admin/DeleteButton";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";

export default async function MuseumToursPage({ params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) notFound();
  const tours = await getToursRawByMuseum(params.id);
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/museums/${museum.id}`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name}
        </Link>
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Tours &amp; Tickets</h1>
          <p className="mt-1 text-sm text-stone-600">The bookable tickets and tours shown on {museum.name}'s page.</p>
        </div>
        <Link
          href={`/admin/museums/${museum.id}/tours/new`}
          className="rounded-lg bg-canal-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-orange/90"
        >
          + Add Tour
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {tours.map((tour) => (
          <div key={tour.id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <SafeImage src={tour.image} alt={tour.imageAlt} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-900">{tour.title}</p>
              <p className="text-sm text-stone-500">
                {museum.currencySymbol}
                {tour.price} · {tour.ribbon || tour.badge} · id: {tour.id}
              </p>
              {(tour.city || tour.country) && (
                <p className="mt-0.5 text-xs text-stone-400">
                  📍 {[tour.city, tour.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <Link href={`/admin/museums/${museum.id}/tours/${tour.id}`} className="shrink-0 text-sm font-medium text-canal-blue hover:underline">
              Edit
            </Link>
            {isAdmin && (
              <DeleteButton
                url={`/api/admin/museums/${museum.id}/tours/${tour.id}`}
                confirmMessage={`Delete "${tour.title}"? This can't be undone.`}
              />
            )}
          </div>
        ))}
        {tours.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No tours yet — add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
