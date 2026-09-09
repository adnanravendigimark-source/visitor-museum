"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SeoFieldsCard from "./SeoFieldsCard";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { BlogSeoSettings } from "@/lib/settings";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export default function BlogSeoForm({ initial }: { initial: BlogSeoSettings }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BlogSeoSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(initial), [settings, initial]);

  function update<K extends keyof BlogSeoSettings>(key: K, value: BlogSeoSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSettings(initial);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live at /blog now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="font-semibold text-stone-900">Blog listing page content</p>
        <p className="mt-0.5 text-xs text-stone-500">
          The hero banner and empty-state/CTA copy shown on /blog. The article grid itself is
          managed from the Posts admin.
        </p>
        <div className="mt-4 space-y-4">
          <Field label="Hero eyebrow">
            <input value={settings.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Hero heading (H1)">
            <input value={settings.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Hero subheading">
            <textarea rows={2} value={settings.heroSubheading} onChange={(e) => update("heroSubheading", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Empty state message" hint="Shown when there are no published posts yet.">
            <input value={settings.emptyStateText} onChange={(e) => update("emptyStateText", e.target.value)} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sidebar promo button text">
              <input value={settings.ctaButtonText} onChange={(e) => update("ctaButtonText", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Sidebar promo button link">
              <input value={settings.ctaButtonHref} onChange={(e) => update("ctaButtonHref", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      </div>

      <SeoFieldsCard
        showMeta
        pathHint="/blog"
        value={settings}
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
      />

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
