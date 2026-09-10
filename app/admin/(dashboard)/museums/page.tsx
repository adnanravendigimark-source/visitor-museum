import Link from "next/link";
import { getMuseums } from "@/lib/museums";
import { getSession } from "@/lib/session";
import MuseumsReorderList from "@/components/admin/MuseumsReorderList";
import RecheckAllNearbyButton from "@/components/admin/RecheckAllNearbyButton";

export const dynamic = "force-dynamic";

export default async function AdminMuseumsPage() {
  const museums = await getMuseums();
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Museums &amp; Attractions</h1>
          <p className="mt-1 text-sm text-stone-600">
            Every museum page on the site — content, tickets, FAQs, location, and SEO.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <RecheckAllNearbyButton museumIds={museums.map((m) => m.id)} />
          <Link
            href="/admin/museums/new"
            className="rounded-lg bg-canal-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-orange/90"
          >
            + Add Museum
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <MuseumsReorderList
          museums={museums.map((m) => ({
            id: m.id,
            slug: m.slug,
            name: m.name,
            city: m.city,
            country: m.country,
            cardImage: m.cardImage,
            cardImageAlt: m.cardImageAlt,
            featured: m.featured,
          }))}
          isAdmin={isAdmin}
        />
        {museums.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No museums yet — add your first one.
          </p>
        )}
      </div>
    </div>
  );
}
