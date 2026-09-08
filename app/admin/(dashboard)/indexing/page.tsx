import { getIndexingOverview } from "@/lib/indexing";
import IndexingManager from "@/components/admin/IndexingManager";

export const dynamic = "force-dynamic";

// Admin-only (see middleware.ts's isIndexingArea check) — this tab spans
// every content section, not just one, so it isn't gated by the normal
// per-section PAGE_KEYS the way Homepage/Posts/etc. are.
export default async function AdminIndexingPage() {
  const rows = await getIndexingOverview();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Indexing</h1>
      <p className="mt-1 text-sm text-stone-600">
        Every page's Search Engine Indexing and Link Following switches, in one place. Changing a
        switch here updates the live site immediately — you'll be asked to confirm first.
      </p>
      <div className="mt-8 max-w-2xl">
        <IndexingManager initial={rows} />
      </div>
    </div>
  );
}
