"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";
import RichTextEditor from "./RichTextEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { OtherAttractionRecord } from "@/lib/otherAttractions";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export default function OtherAttractionForm({
  museumId,
  currencySymbol,
  initial,
  isNew,
}: {
  museumId: string;
  currencySymbol: string;
  initial: OtherAttractionRecord;
  isNew: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [attraction, setAttraction] = useState<OtherAttractionRecord>(initial);
  const [includesText, setIncludesText] = useState((initial.includes || []).join("\n"));
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

  function update<K extends keyof OtherAttractionRecord>(key: K, value: OtherAttractionRecord[K]) {
    setAttraction((a) => ({ ...a, [key]: value }));
    setDirty(true);
  }

  // Matches TourCard's own cap — the card only ever shows the first 3
  // Includes lines.
  function handleIncludesChange(value: string) {
    const lines = value.split("\n");
    setIncludesText(lines.length > 3 ? lines.slice(0, 3).join("\n") : value);
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: OtherAttractionRecord = {
      ...attraction,
      museumId,
      includes: includesText.split("\n").map((s) => s.trim()).filter(Boolean),
      rating: Number(attraction.rating),
      reviews: Number(attraction.reviews),
      price: Number(attraction.price),
      originalPrice: attraction.originalPrice ? Number(attraction.originalPrice) : undefined,
    };

    const url = isNew ? `/api/admin/attractions/${museumId}` : `/api/admin/attractions/${museumId}/${initial.id}`;
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
    showToast("success", isNew ? "Attraction created." : "Attraction saved.");
    router.push(`/admin/attractions/${museumId}`);
    router.refresh();
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    router.push(`/admin/attractions/${museumId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Field label="ID (URL-safe, unique)" hint={isNew ? "Can't be changed after this attraction is created." : "Locked — set only when an attraction is first created."}>
        <input
          required
          disabled={!isNew}
          value={attraction.id}
          onChange={(e) => update("id", e.target.value)}
          className={`${inputClass} ${!isNew ? "bg-stone-100 text-stone-500" : ""}`}
          placeholder="e.g. eiffel-tower-other-attraction"
        />
      </Field>

      <Field label="Title">
        <input required value={attraction.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Description" hint="Shown on the card (clamped to 2 lines) — keep it short.">
        <RichTextEditor value={attraction.description} onChange={(html) => update("description", html)} minHeight="4rem" allowedHeadings={[]} />
      </Field>

      <Field label="Includes (one per line — max 3)">
        <textarea rows={3} value={includesText} onChange={(e) => handleIncludesChange(e.target.value)} className={inputClass} />
        <p className="mt-1 text-xs text-amber-700">⚠️ Only the first 3 lines show on the card — a 4th line can&apos;t be added here.</p>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ribbon badge (optional)" hint="Shown as a small ★ badge over the image, e.g. Bestseller.">
          <input value={attraction.ribbon || ""} onChange={(e) => update("ribbon", e.target.value)} className={inputClass} placeholder="e.g. Bestseller" />
        </Field>
        <Field label="Duration" hint="Shown under the price, e.g. '2 hours' or 'Full day'.">
          <input value={attraction.duration || ""} onChange={(e) => update("duration", e.target.value)} className={inputClass} placeholder="e.g. 2 hours" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <Field label="Rating">
          <input type="number" step="0.1" min="0" max="5" required value={attraction.rating} onChange={(e) => update("rating", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Review count">
          <input type="number" min="0" required value={attraction.reviews} onChange={(e) => update("reviews", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label={`Price (${currencySymbol.trim()})`}>
          <input type="number" min="0" required value={attraction.price} onChange={(e) => update("price", Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Was-price (optional)" hint="Shown crossed out next to the price when set.">
          <input
            type="number"
            min="0"
            value={attraction.originalPrice ?? ""}
            onChange={(e) => update("originalPrice", (e.target.value ? Number(e.target.value) : undefined) as unknown as number)}
            className={inputClass}
          />
        </Field>
      </div>

      <ImageUploadField label="Image" value={attraction.image} onChange={(url) => update("image", url)} aspectRatio={16 / 10} />

      <Field label="Image alt text">
        <input required value={attraction.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Booking link (path or full URL)" hint="A GetYourGuide path (partner link is built automatically) or paste any full https:// URL.">
          <input
            required
            value={attraction.hrefPath || ""}
            onChange={(e) => update("hrefPath", e.target.value)}
            className={inputClass}
            placeholder="paris-l16/eiffel-tower-t12345 — or paste a full https:// URL"
          />
        </Field>
        <Field label="Link extra params (optional)">
          <input value={attraction.hrefExtra || ""} onChange={(e) => update("hrefExtra", e.target.value)} className={inputClass} placeholder="&placement=content-top" />
        </Field>
      </div>

      <SaveBar saving={saving} disabled={!dirty} label={isNew ? "Create Attraction" : "Save Changes"} onCancel={handleCancel} />
    </form>
  );
}
