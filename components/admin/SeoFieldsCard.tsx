"use client";

import Link from "next/link";
import ImageUploadField from "./ImageUploadField";

// Everything one page needs for full on-page + technical SEO control,
// bundled into one reusable card so it looks and behaves identically
// everywhere it's embedded (Homepage, Posts, Privacy Policy, About,
// Contact, Blog listing SEO). See lib/seo.ts for how each of these
// fields is actually resolved into rendered HTML/metadata on the public
// site — nothing here is decorative, every field changes real output.
export interface SeoFieldsValue {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

export default function SeoFieldsCard({
  value,
  onChange,
  showMeta = false,
  pathHint,
}: {
  value: SeoFieldsValue;
  onChange: (patch: Partial<SeoFieldsValue>) => void;
  // When true, renders the "SEO Title" / "Meta Description" fields too —
  // only pages whose visible page title isn't already controlled
  // elsewhere (the homepage's title comes from the site-wide default in
  // app/layout.tsx) need these.
  showMeta?: boolean;
  // Shown next to the Canonical URL field as a hint for what it
  // auto-generates to when left blank, e.g. "/about".
  pathHint?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="font-semibold text-stone-900">Search Engine Optimization (SEO)</p>
      <p className="mt-0.5 text-xs text-stone-500">
        Controls exactly what Google and social platforms see for this page — title, description,
        canonical URL, indexing, and social share preview.
      </p>

      <div className="mt-5 space-y-5">
        {showMeta && (
          <>
            <div>
              <label className={labelClass}>SEO Title</label>
              <input
                value={value.metaTitle || ""}
                onChange={(e) => onChange({ metaTitle: e.target.value })}
                className={inputClass}
                placeholder="Shown in Google search results and the browser tab"
              />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea
                rows={2}
                value={value.metaDescription || ""}
                onChange={(e) => onChange({ metaDescription: e.target.value })}
                className={inputClass}
                placeholder="Shown under the title in Google search results (~155 characters)"
              />
            </div>
          </>
        )}

        <div>
          <label className={labelClass}>Canonical URL (optional)</label>
          <input
            value={value.canonicalUrl}
            onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            className={inputClass}
            placeholder={
              pathHint ? `Leave blank to auto-generate: ${pathHint}` : "Leave blank to auto-generate from the page's URL"
            }
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">Search Engine Indexing &amp; Link Following</p>
            <p className="mt-0.5 text-xs text-stone-500">
              Currently{" "}
              <span className={value.noIndex ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                {value.noIndex ? "noindex" : "index"}
              </span>
              {", "}
              <span className={value.noFollow ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                {value.noFollow ? "nofollow" : "follow"}
              </span>
              . Managed from one place for every page.
            </p>
          </div>
          <Link
            href="/admin/indexing"
            className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Manage in Indexing →
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <p className="text-sm font-semibold text-stone-900">Open Graph &amp; Twitter/X Preview</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Used when this page is shared on Facebook, WhatsApp, iMessage, Twitter/X, etc. Leave blank
            to fall back to the page's own title, description, and image.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Social Title (optional)</label>
              <input
                value={value.ogTitle}
                onChange={(e) => onChange({ ogTitle: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Social Description (optional)</label>
              <textarea
                rows={2}
                value={value.ogDescription}
                onChange={(e) => onChange({ ogDescription: e.target.value })}
                className={inputClass}
              />
            </div>
            <ImageUploadField
              label="Social Share Image (optional)"
              value={value.ogImage}
              onChange={(url) => onChange({ ogImage: url })}
              aspectRatio={1.91 / 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
