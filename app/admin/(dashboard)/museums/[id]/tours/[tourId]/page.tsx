import { notFound } from "next/navigation";
import Link from "next/link";
import { getMuseumById, getToursRawByMuseum } from "@/lib/museums";
import MuseumTourForm from "@/components/admin/MuseumTourForm";

export const dynamic = "force-dynamic";

export default async function EditMuseumTourPage({ params }: { params: { id: string; tourId: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) notFound();
  const tours = await getToursRawByMuseum(params.id);
  const tour = tours.find((t) => t.id === params.tourId);
  if (!tour) notFound();

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/museums/${museum.id}/tours`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name} tours
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">Edit Tour</h1>
      <div className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6">
        <MuseumTourForm museumId={museum.id} currencySymbol={museum.currencySymbol} initial={tour} isNew={false} />
      </div>
    </div>
  );
}
