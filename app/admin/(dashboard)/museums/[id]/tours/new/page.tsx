import { notFound } from "next/navigation";
import Link from "next/link";
import { getMuseumById, type TourRecord } from "@/lib/museums";
import MuseumTourForm from "@/components/admin/MuseumTourForm";

export const dynamic = "force-dynamic";

export default async function NewMuseumTourPage({ params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) notFound();

  const blank: TourRecord = {
    id: "",
    museumId: museum.id,
    badge: "self-guided",
    ribbon: "",
    title: "",
    description: "",
    includes: [],
    duration: "",
    rating: 5,
    reviews: 0,
    price: 0,
    originalPrice: undefined,
    image: "",
    imageAlt: "",
    hrefPath: "",
    hrefExtra: "",
    featured: false,
    bestFor: "",
    // Defaults to this museum's own location — the overwhelmingly common
    // case is a ticket for a visit to this exact museum. Still editable
    // per ticket (see MuseumTourForm's City field) for a combo ticket that
    // genuinely covers more than one city.
    city: museum.city,
    country: museum.country,
  };

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/museums/${museum.id}/tours`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name} tours
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">Add Tour</h1>
      <div className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6">
        <MuseumTourForm museumId={museum.id} currencySymbol={museum.currencySymbol} initial={blank} isNew />
      </div>
    </div>
  );
}
