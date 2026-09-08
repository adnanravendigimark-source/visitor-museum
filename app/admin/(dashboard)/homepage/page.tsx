import { getHomepageContent } from "@/lib/homepage";
import HomepageForm from "@/components/admin/HomepageForm";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const content = await getHomepageContent();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Homepage Content</h1>
      <p className="mt-1 text-sm text-stone-600">
        Every visible piece of the homepage — navbar, hero, sections, footer, images, and SEO — lives
        here. Edits appear on the live site immediately after saving, no rebuild or hard refresh needed.
      </p>
      <div className="mt-8 max-w-3xl">
        <HomepageForm initial={content} />
      </div>
    </div>
  );
}
