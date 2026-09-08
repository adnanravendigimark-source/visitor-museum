import { notFound } from "next/navigation";
import Link from "next/link";
import { getMuseumById, getFaqsByMuseum } from "@/lib/museums";
import MuseumFaqsForm from "@/components/admin/MuseumFaqsForm";

export const dynamic = "force-dynamic";

export default async function MuseumFaqsPage({ params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) notFound();
  const faqs = await getFaqsByMuseum(params.id);

  return (
    <div>
      <p className="text-sm">
        <Link href={`/admin/museums/${museum.id}`} className="font-medium text-canal-blue hover:underline">
          ← Back to {museum.name}
        </Link>
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">FAQs</h1>
      <p className="mt-1 text-sm text-stone-600">Shown in {museum.name}'s FAQ accordion, in this order.</p>
      <div className="mt-8 max-w-2xl">
        <MuseumFaqsForm museumId={museum.id} initial={faqs} />
      </div>
    </div>
  );
}
