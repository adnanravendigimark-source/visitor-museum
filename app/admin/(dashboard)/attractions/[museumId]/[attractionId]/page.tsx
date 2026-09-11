import { notFound } from "next/navigation";
import Link from "next/link";
import { getMuseumById } from "@/lib/museums";
import { getOtherAttractionsByMuseum } from "@/lib/otherAttractions";
import OtherAttractionForm from "@/components/admin/OtherAttractionForm";

export const dynamic = "force-dynamic";

export default async function EditAttractionPage({ params }: { params: { museumId: string; attractionId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) notFound();
  const attractions = await getOtherAttractionsByMuseum(params.museumId);
  const attraction = attractions.find((a) => a.id === params.attractionId);
  if (!attraction) notFound();

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/attractions/${museum.id}`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name} attractions
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">Edit Attraction</h1>
      <div className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6">
        <OtherAttractionForm museumId={museum.id} currencySymbol={museum.currencySymbol} initial={attraction} isNew={false} />
      </div>
    </div>
  );
}
