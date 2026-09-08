"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";
import SeoFieldsCard from "./SeoFieldsCard";
import RichTextEditor from "./RichTextEditor";
import TiptapArticleEditor from "./TiptapArticleEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { AboutPageContent } from "@/lib/about";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="font-semibold text-stone-900">{title}</p>
      {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </div>
  );
}

export default function AboutForm({ initial }: { initial: AboutPageContent }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [about, setAbout] = useState<AboutPageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => JSON.stringify(about) !== JSON.stringify(initial), [about, initial]);

  function update<K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) {
    setAbout((a) => ({ ...a, [key]: value }));
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setAbout(initial);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(about),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live at /about now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <SectionCard title="Page title" description="The hero banner readers see first.">
        <div>
          <label className={labelClass}>Eyebrow label</label>
          <input value={about.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} className={inputClass} placeholder="About Us" />
        </div>
        <div>
          <label className={labelClass}>Heading (H1)</label>
          <textarea rows={2} value={about.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lede</label>
          <RichTextEditor value={about.heroSubheading} onChange={(html) => update("heroSubheading", html)} minHeight="4rem" allowedHeadings={[]} />
        </div>
        <ImageUploadField label="Hero background photo" value={about.heroImage} onChange={(url) => update("heroImage", url)} aspectRatio={16 / 9} />
        <div>
          <label className={labelClass}>Hero photo alt text</label>
          <input value={about.heroImageAlt} onChange={(e) => update("heroImageAlt", e.target.value)} className={inputClass} />
        </div>
      </SectionCard>

      <SectionCard title="Page Content" description="Write the whole page body here, top to bottom, just like a blog article.">
        <TiptapArticleEditor
          value={about.content}
          onChange={(html) => update("content", html)}
          placeholder="Write the About page here… use the toolbar for headings, bold, links, lists, tables, or images."
          allowedHeadings={[2, 3]}
          minHeight="30rem"
        />
      </SectionCard>

      <SeoFieldsCard
        showMeta
        pathHint="/about"
        value={{
          metaTitle: about.metaTitle,
          metaDescription: about.metaDescription,
          canonicalUrl: about.canonicalUrl,
          noIndex: about.noIndex,
          noFollow: about.noFollow,
          ogTitle: about.ogTitle,
          ogDescription: about.ogDescription,
          ogImage: about.ogImage,
        }}
        onChange={(patch) => setAbout((a) => ({ ...a, ...patch }))}
      />

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
