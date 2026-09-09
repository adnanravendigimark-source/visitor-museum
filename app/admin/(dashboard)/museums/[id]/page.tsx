import { notFound } from "next/navigation";
import { getMuseumById, getToursRawByMuseum } from "@/lib/museums";
import MuseumForm from "@/components/admin/MuseumForm";

export const dynamic = "force-dynamic";

export default async function EditMuseumPage({ params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) notFound();
  const tours = await getToursRawByMuseum(params.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Edit Museum</h1>
      <p className="mt-1 text-sm text-stone-600">Editing "{museum.name}"</p>
      <div className="mt-8 max-w-4xl">
        <MuseumForm initial={museum} isNew={false} tours={tours} />
      </div>
    </div>
  );
}
