"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SeoFieldsCard from "./SeoFieldsCard";
import RichTextEditor from "./RichTextEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { ContentBlock, ContentBlockType } from "@/lib/posts";
import type { PrivacyPolicy } from "@/lib/legal";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";

function emptyBlock(type: ContentBlockType): ContentBlock {
  return type === "list" ? { type, items: [""] } : { type, text: "" };
}

export default function PrivacyPolicyForm({ initial }: { initial: PrivacyPolicy }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [policy, setPolicy] = useState<PrivacyPolicy>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof PrivacyPolicy>(key: K, value: PrivacyPolicy[K]) {
    setPolicy((p) => ({ ...p, [key]: value }));
  }

  function updateBlock(i: number, block: ContentBlock) {
    const next = [...policy.content];
    next[i] = block;
    update("content", next);
  }

  function addBlock(type: ContentBlockType) {
    update("content", [...policy.content, emptyBlock(type)]);
  }

  function removeBlock(i: number) {
    update("content", policy.content.filter((_, idx) => idx !== i));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= policy.content.length) return;
    const next = [...policy.content];
    [next[i], next[j]] = [next[j], next[i]];
    update("content", next);
  }

  const dirty = useMemo(() => JSON.stringify(policy) !== JSON.stringify(initial), [policy, initial]);

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setPolicy(initial);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/privacy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policy),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live at /privacy-policy now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Page title (H1)</label>
          <input value={policy.title} onChange={(e) => update("title", e.target.value)} className={inputClass} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">"Last updated" label prefix</label>
            <input value={policy.lastUpdatedLabel} onChange={(e) => update("lastUpdatedLabel", e.target.value)} className={inputClass} placeholder="Last updated: " />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Empty-state message</label>
            <input value={policy.emptyStateText} onChange={(e) => update("emptyStateText", e.target.value)} className={inputClass} placeholder="This page hasn't been filled in yet." />
          </div>
        </div>
        <p className="text-xs text-stone-500">
          Last updated: {policy.lastUpdated || "—"} (the date itself updates automatically when you save)
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="font-semibold text-stone-900">Policy content</p>
        <p className="mt-0.5 text-xs text-stone-500">
          Same section-by-section editor as blog posts — add a heading for each section, paragraphs for
          body text, and bullet lists where useful.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => addBlock("heading")} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
            + Heading
          </button>
          <button type="button" onClick={() => addBlock("paragraph")} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
            + Paragraph
          </button>
          <button type="button" onClick={() => addBlock("list")} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
            + Bullet list
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {policy.content.map((block, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500 ring-1 ring-stone-200">
                  {i + 1} · {block.type}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} className="text-stone-500 hover:text-stone-900 disabled:opacity-30">
                    ↑ Up
                  </button>
                  <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === policy.content.length - 1} className="text-stone-500 hover:text-stone-900 disabled:opacity-30">
                    ↓ Down
                  </button>
                  <button type="button" onClick={() => removeBlock(i)} className="text-red-600 hover:text-red-700">
                    Remove
                  </button>
                </div>
              </div>

              {block.type === "list" ? (
                <textarea
                  rows={3}
                  value={(block.items || []).join("\n")}
                  onChange={(e) => updateBlock(i, { type: "list", items: e.target.value.split("\n") })}
                  placeholder="One list item per line"
                  className={inputClass}
                />
              ) : block.type === "heading" ? (
                <textarea
                  rows={1}
                  value={block.text || ""}
                  onChange={(e) => updateBlock(i, { type: block.type, text: e.target.value })}
                  placeholder="Section heading"
                  className={inputClass}
                />
              ) : (
                <RichTextEditor
                  value={block.text || ""}
                  onChange={(html) => updateBlock(i, { type: block.type, text: html })}
                  placeholder="Paragraph text"
                  minHeight="5rem"
                  allowedHeadings={[]}
                />
              )}
            </div>
          ))}
          {policy.content.length === 0 && (
            <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
              No content yet — add a heading or paragraph above to get started.
            </p>
          )}
        </div>
      </div>

      <SeoFieldsCard
        showMeta
        pathHint="/privacy-policy"
        value={{
          metaTitle: policy.metaTitle,
          metaDescription: policy.metaDescription,
          canonicalUrl: policy.canonicalUrl,
          noIndex: policy.noIndex,
          noFollow: policy.noFollow,
          ogTitle: policy.ogTitle,
          ogDescription: policy.ogDescription,
          ogImage: policy.ogImage,
        }}
        onChange={(patch) => setPolicy((p) => ({ ...p, ...patch }))}
      />

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
