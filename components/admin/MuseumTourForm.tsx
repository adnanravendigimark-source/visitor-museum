"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";
import RichTextEditor from "./RichTextEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { TourRecord } from "@/lib/museums";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";
const panelClass = "space-y-5 rounded-2xl border border-stone-200 bg-white p-6";

const TABS = [
  { key: "basics", label: "Basics", icon: "📝" },
  { key: "features", label: "Features", icon: "✅" },
  { key: "pricing", label: "Pricing & Reviews", icon: "💰" },
  { key: "image", label: "Image", icon: "🖼️" },
  { key: "booking", label: "Booking & Table", icon: "🔗" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export default function MuseumTourForm({
  museumId,
  currencySymbol,
  initial,
  isNew,
}: {
  museumId: string;
  currencySymbol: string;
  initial: TourRecord;
  isNew: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  // Older tours (imported before this admin form existed) have their
  // promotional badge text sitting in the legacy `badge` column instead of
  // the current `ribbon` field the public card actually prefers to read
  // from — surface it here so what the admin sees editable always matches
  // what's live on the site, and saving moves it onto the modern field.
  const [tour, setTour] = useState<TourRecord>({ ...initial, ribbon: initial.ribbon || initial.badge || "" });
  const [includesText, setIncludesText] = useState((initial.includes || []).join("\n"));
  const [activeTab, setActiveTab] = useState<TabKey>("basics");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function update<K extends keyof TourRecord>(key: K, value: TourRecord[K]) {
    setTour((t) => ({ ...t, [key]: value }));
    setDirty(true);
  }

  // The ticket card only ever shows the first 3 Includes lines — capping
  // input here at 3 lines means the admin can never type something they
  // won't actually see live.
  function handleIncludesChange(value: string) {
    const lines = value.split("\n");
    setIncludesText(lines.length > 3 ? lines.slice(0, 3).join("\n") : value);
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: TourRecord = {
      ...tour,
      museumId,
      includes: includesText.split("\n").map((s) => s.trim()).filter(Boolean),
      rating: Number(tour.rating),
      reviews: Number(tour.reviews),
      price: Number(tour.price),
      originalPrice: tour.originalPrice ? Number(tour.originalPrice) : undefined,
    };

    const url = isNew ? `/api/admin/museums/${museumId}/tours` : `/api/admin/museums/${museumId}/tours/${initial.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      const msg = data.error || "Save failed.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    setDirty(false);
    showToast("success", isNew ? "Tour created." : "Tour saved.");
    router.push(`/admin/museums/${museumId}/tours`);
    router.refresh();
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    router.push(`/admin/museums/${museumId}/tours`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-2xl border border-stone-200 bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? "bg-canal-blue text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* ---------------- BASICS TAB ---------------- */}
      {activeTab === "basics" && (
        <div className={panelClass}>
          <Field label="ID (URL-safe, unique)" hint={isNew ? "Can't be changed after this tour is created." : "Locked — set only when a tour is first created."}>
            <input
              required
              disabled={!isNew}
              value={tour.id}
              onChange={(e) => update("id", e.target.value)}
              className={`${inputClass} ${!isNew ? "bg-stone-100 text-stone-500" : ""}`}
              placeholder="e.g. louvre-skip-the-line-guided-tour"
            />
          </Field>

          <Field label="Title">
            <input required value={tour.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
          </Field>

          <Field label="Description" hint="Shown on the tour card (clamped to 2 lines) — keep it short.">
            <RichTextEditor value={tour.description} onChange={(html) => update("description", html)} minHeight="4rem" allowedHeadings={[]} />
          </Field>

          <Field label="Ribbon badge (optional)" hint="Shown as a small ★ badge over the ticket image, e.g. Bestseller.">
            <input value={tour.ribbon || ""} onChange={(e) => update("ribbon", e.target.value)} className={inputClass} placeholder="e.g. Bestseller" />
          </Field>
        </div>
      )}

      {/* ---------------- FEATURES TAB ---------------- */}
      {activeTab === "features" && (
        <div className={panelClass}>
          <Field label="Includes (one per line — max 3)">
            <textarea rows={3} value={includesText} onChange={(e) => handleIncludesChange(e.target.value)} className={inputClass} />
            <p className="mt-1 text-xs text-amber-700">⚠️ Only the first 3 lines show on the ticket card — a 4th line can&apos;t be added here.</p>
          </Field>

          <Field label="Duration" hint="Shown under the price, e.g. '2 hours' or 'Full day'.">
            <input value={tour.duration || ""} onChange={(e) => update("duration", e.target.value)} className={inputClass} placeholder="e.g. 2 hours" />
          </Field>
        </div>
      )}

      {/* ---------------- PRICING TAB ---------------- */}
      {activeTab === "pricing" && (
        <div className={panelClass}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Price (${currencySymbol.trim()})`}>
              <input type="number" min="0" required value={tour.price} onChange={(e) => update("price", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Was-price (optional)" hint="Shown crossed out next to the price when set.">
              <input
                type="number"
                min="0"
                value={tour.originalPrice ?? ""}
                onChange={(e) => update("originalPrice", (e.target.value ? Number(e.target.value) : undefined) as unknown as number)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Rating">
              <input type="number" step="0.1" min="0" max="5" required value={tour.rating} onChange={(e) => update("rating", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Review count">
              <input type="number" min="0" required value={tour.reviews} onChange={(e) => update("reviews", Number(e.target.value))} className={inputClass} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={!!tour.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-stone-300" />
            Featured (shown in rich-result structured data)
          </label>
        </div>
      )}

      {/* ---------------- IMAGE TAB ---------------- */}
      {activeTab === "image" && (
        <div className={panelClass}>
          <ImageUploadField label="Image" value={tour.image} onChange={(url) => update("image", url)} aspectRatio={4 / 3} />
          <Field label="Image alt text">
            <input required value={tour.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} className={inputClass} />
          </Field>
        </div>
      )}

      {/* ---------------- BOOKING & TABLE TAB ---------------- */}
      {activeTab === "booking" && (
        <div className={panelClass}>
          <Field label="GetYourGuide link (path or full URL)">
            <input
              required
              value={tour.hrefPath || ""}
              onChange={(e) => update("hrefPath", e.target.value)}
              className={inputClass}
              placeholder="paris-l16/louvre-tour-t12345 — or paste a full https:// URL"
            />
          </Field>

          <Field label="Link extra params (optional)">
            <input value={tour.hrefExtra || ""} onChange={(e) => update("hrefExtra", e.target.value)} className={inputClass} placeholder="&placement=content-top" />
          </Field>

          <Field label="Best for">
            <input required value={tour.bestFor || ""} onChange={(e) => update("bestFor", e.target.value)} className={inputClass} />
          </Field>

          <Field label="Price table: column 1 (optional)" hint="Shown in the price-comparison table's first column. Leave blank to use Duration.">
            <input value={tour.priceTableColumn1 || ""} onChange={(e) => update("priceTableColumn1", e.target.value)} className={inputClass} placeholder="e.g. 2 hours" />
          </Field>

          <Field label="Price table: column 2 (optional)" hint="Shown in the price-comparison table's second column.">
            <input value={tour.priceTableFeature || ""} onChange={(e) => update("priceTableFeature", e.target.value)} className={inputClass} placeholder="e.g. ✅ Skip-the-Line Entry" />
          </Field>
        </div>
      )}

      <SaveBar saving={saving} disabled={!dirty} label={isNew ? "Create Tour" : "Save Changes"} onCancel={handleCancel} />
    </form>
  );
}
