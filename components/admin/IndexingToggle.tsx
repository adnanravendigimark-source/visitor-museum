"use client";

// Reusable per-page "Search Engine Indexing" control — embedded in the
// Post/Homepage/Privacy Policy forms and the About/Contact/Blog SEO page
// (via SectionCard/rounded-2xl wrappers matching each form's existing
// style) and saved together with the rest of that page's fields on
// submit, same as every other field. See lib/seo.ts for how this value
// becomes the actual <meta name="robots"> tag.
export default function IndexingToggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const enabled = !checked; // checked = noIndex; the switch shows "indexing allowed"

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-900">Search Engine Indexing</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {enabled
              ? "Allow Google and other search engines to index this page."
              : "Search engines will be instructed not to index this page."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={disabled}
          // Clicking flips the visual "enabled" state to !enabled, which
          // means the new noIndex value (what the parent form stores) is
          // simply the current `enabled` value.
          onClick={() => onChange(enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
            enabled ? "bg-green-500" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
          enabled ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-green-500" : "bg-amber-500"}`} />
        {enabled ? "ON — Index, follow" : "OFF — Noindex, nofollow"}
      </p>
    </div>
  );
}
