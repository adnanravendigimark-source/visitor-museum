import Link from "next/link";
import { notFound } from "next/navigation";
import { getMuseumById } from "@/lib/museums";
import { getOtherAttractionsByMuseum } from "@/lib/otherAttractions";
import DeleteButton from "@/components/admin/DeleteButton";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";

export default async function MuseumAttractionsPage({ params }: { params: { museumId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) notFound();
  const attractions = await getOtherAttractionsByMuseum(params.museumId);

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/attractions" className="font-medium text-canal-blue hover:underline">
          ← Back to Other Attractions
        </Link>
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Other Attractions</h1>
          <p className="mt-1 text-sm text-stone-600">
            Shown on {museum.name}'s own page ({museum.city}, {museum.country}), right below its Tours &amp; Tickets.
          </p>
        </div>
        <Link
          href={`/admin/attractions/${museum.id}/new`}
          className="rounded-lg bg-canal-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-orange/90"
        >
          + Add Attraction
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {attractions.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <SafeImage src={a.image} alt={a.imageAlt || a.title} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-900">{a.title}</p>
              <p className="text-sm text-stone-500">
                {museum.currencySymbol}
                {a.price} · ★ {a.rating} · id: {a.id}
              </p>
            </div>
            <Link href={`/admin/attractions/${museum.id}/${a.id}`} className="shrink-0 text-sm font-medium text-canal-blue hover:underline">
              Edit
            </Link>
            <DeleteButton
              url={`/api/admin/attractions/${museum.id}/${a.id}`}
              confirmMessage={`Delete "${a.title}"? This can't be undone.`}
            />
          </div>
        ))}
        {attractions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No attractions yet — add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
