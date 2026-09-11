import { getHomepageContent } from "@/lib/homepage";
import { getMuseums, getCountryCityMap } from "@/lib/museums";
import HomepageForm from "@/components/admin/HomepageForm";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);
  // Every country that actually has at least one museum — powers the
  // "Popular Countries" section's country picker, so an admin can only ever
  // feature a country that has real museums/tickets behind it (never a
  // typo'd/dead one with nothing to show on /museums?country=...).
  const availableCountries = getCountryCityMap(museums).map((c) => c.country);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Homepage Content</h1>
      <p className="mt-1 text-sm text-stone-600">
        Every visible piece of the homepage — navbar, hero, sections, footer, images, and SEO — lives
        here. Edits appear on the live site immediately after saving, no rebuild or hard refresh needed.
      </p>
      <div className="mt-8 max-w-3xl">
        <HomepageForm initial={content} availableCountries={availableCountries} />
      </div>
    </div>
  );
}
