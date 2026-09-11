import { notFound } from "next/navigation";
import Link from "next/link";
import { getMuseumById } from "@/lib/museums";
import OtherAttractionForm from "@/components/admin/OtherAttractionForm";
import type { OtherAttractionRecord } from "@/lib/otherAttractions";

export const dynamic = "force-dynamic";

export default async function NewAttractionPage({ params }: { params: { museumId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) notFound();

  const blank: OtherAttractionRecord = {
    id: "",
    museumId: museum.id,
    badge: "",
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
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/attractions/${museum.id}`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name} attractions
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">Add Other Attraction</h1>
      <p className="mt-1 text-sm text-stone-600">Shown on {museum.name}'s own page.</p>
      <div className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6">
        <OtherAttractionForm museumId={museum.id} currencySymbol={museum.currencySymbol} initial={blank} isNew />
      </div>
    </div>
  );
}
