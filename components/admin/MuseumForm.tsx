"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploadField from "./ImageUploadField";
import RichTextEditor from "./RichTextEditor";
import RepeatableList from "./RepeatableList";
import SeoPreview from "./SeoPreview";
import CharCounter from "./CharCounter";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { Museum, HighlightCard, HoursRow } from "@/lib/museums";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";

const TABS = [
  { key: "details", label: "Details", icon: "🏛️" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "highlights", label: "Highlights", icon: "✨" },
  { key: "practical", label: "Practical Info", icon: "🕒" },
  { key: "tickets", label: "Tickets & FAQ", icon: "🎟️" },
  { key: "seo", label: "SEO", icon: "🔍" },
  { key: "social", label: "Social Media", icon: "📣" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MuseumForm({ initial, isNew }: { initial: Museum; isNew: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [museum, setMuseum] = useState<Museum>(initial);
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  function update<K extends keyof Museum>(key: K, value: Museum[K]) {
    setMuseum((m) => ({ ...m, [key]: value }));
    setDirty(true);
  }

  function handleNameChange(name: string) {
    setMuseum((m) => {
      const next = { ...m, name };
      if (isNew) {
        const slug = slugify(name);
        next.slug = slug;
        next.id = slug;
      }
      return next;
    });
    setDirty(true);
  }

  const focusChecklist = useMemo(() => {
    const kw = museum.focusKeyword.trim().toLowerCase();
    if (!kw) return null;
    const plainSubheading = museum.heroSubheading.replace(/<[^>]+>/g, "");
    const inTitle = (museum.metaTitle || museum.heroHeading).toLowerCase().includes(kw);
    const inH1 = museum.heroHeading.toLowerCase().includes(kw);
    const inDescription = (museum.metaDescription || plainSubheading).toLowerCase().includes(kw);
    const inUrl = museum.slug.toLowerCase().includes(kw.replace(/\s+/g, "-"));
    return [
      { label: "Appears in the SEO title", pass: inTitle },
      { label: "Appears in the H1 headline", pass: inH1 },
      { label: "Appears in the meta description", pass: inDescription },
      { label: "Appears in the URL slug", pass: inUrl },
    ];
  }, [museum.focusKeyword, museum.metaTitle, museum.heroHeading, museum.metaDescription, museum.heroSubheading, museum.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!museum.id.trim() || !museum.slug.trim() || !museum.name.trim()) {
      setSaving(false);
      setError("Name is required (ID and slug are generated from it).");
      return;
    }
    if (!Number.isFinite(museum.lat) || !Number.isFinite(museum.lng) || (museum.lat === 0 && museum.lng === 0)) {
      setSaving(false);
      setError("A real latitude/longitude is required for the Nearby Attractions feature to work — see the Location tab.");
      return;
    }

    const url = isNew ? "/api/admin/museums" : `/api/admin/museums/${initial.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(museum),
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
    showToast("success", isNew ? "Museum created." : "Museum saved.");
    if (isNew) {
      router.push(`/admin/museums/${museum.id}`);
    } else {
      router.refresh();
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    if (isNew) {
      router.push("/admin/museums");
    } else {
      setMuseum(initial);
      setDirty(false);
      setError("");
    }
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

      {!isNew && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-3">
            <Link href={`/admin/museums/${museum.id}/tours`} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
              Manage Tours & Tickets →
            </Link>
            <Link href={`/admin/museums/${museum.id}/faqs`} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
              Manage FAQs →
            </Link>
          </div>
          <Link href={`/${museum.slug}`} target="_blank" className="shrink-0 text-xs font-medium text-canal-blue hover:underline">
            View live page →
          </Link>
        </div>
      )}

      {/* ---------------- DETAILS TAB ---------------- */}
      {activeTab === "details" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Museum / attraction name">
                <input required value={museum.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Louvre Museum" />
              </Field>
              <Field label="Currency symbol" hint='e.g. "€", "CHF ", "$"'>
                <input value={museum.currencySymbol} onChange={(e) => update("currencySymbol", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="City">
                <input required value={museum.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Country">
                <input required value={museum.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="ID (URL-safe, unique)" hint="Used internally for tours/FAQs — generated from the name, can't be changed after creation.">
                <input
                  required
                  disabled={!isNew}
                  value={museum.id}
                  onChange={(e) => update("id", slugify(e.target.value))}
                  className={`${inputClass} ${!isNew ? "bg-stone-100 text-stone-500" : ""}`}
                />
              </Field>
              <Field label="URL slug" hint={`Public URL: /${museum.slug || "your-slug"}`}>
                <input required value={museum.slug} onChange={(e) => update("slug", slugify(e.target.value))} className={inputClass} placeholder="e.g. louvre-museum-tickets-tour" />
              </Field>
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={!!museum.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-stone-300" />
              Featured (shown first / highlighted on the museums grid)
            </label>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Museums grid card</p>
            <ImageUploadField label="Card photo" value={museum.cardImage} onChange={(url) => update("cardImage", url)} aspectRatio={4 / 3} />
            <Field label="Card photo alt text">
              <input value={museum.cardImageAlt} onChange={(e) => update("cardImageAlt", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Card tagline" hint="Short line shown under the museum name on the grid card.">
              <input value={museum.cardTagline} onChange={(e) => update("cardTagline", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Museum page hero</p>
            <Field label="Hero badge (small pill above the headline)">
              <input value={museum.heroBadge} onChange={(e) => update("heroBadge", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hero headline (H1)">
              <textarea rows={2} value={museum.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hero subheading">
              <RichTextEditor value={museum.heroSubheading} onChange={(html) => update("heroSubheading", html)} minHeight="4rem" />
            </Field>
            <ImageUploadField label="Hero photo" value={museum.heroImage} onChange={(url) => update("heroImage", url)} aspectRatio={16 / 9} />
            <Field label="Hero photo alt text">
              <input value={museum.heroImageAlt} onChange={(e) => update("heroImageAlt", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- LOCATION TAB ---------------- */}
      {activeTab === "location" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Coordinates</p>
            <p className="text-xs text-stone-500">
              Powers the "Other Attractions in {museum.city || "this city"}" section on the live page — real
              lat/lng is required so walking (≤3km) and driving (≤10km) distances to every other museum can be
              calculated. Get exact coordinates from Google Maps: right-click the pin → click the coordinates to copy them.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Latitude">
                <input
                  type="number"
                  step="any"
                  required
                  value={museum.lat}
                  onChange={(e) => update("lat", Number(e.target.value))}
                  className={inputClass}
                  placeholder="e.g. 48.860611"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="any"
                  required
                  value={museum.lng}
                  onChange={(e) => update("lng", Number(e.target.value))}
                  className={inputClass}
                  placeholder="e.g. 2.337644"
                />
              </Field>
            </div>
            {Number.isFinite(museum.lat) && Number.isFinite(museum.lng) && !(museum.lat === 0 && museum.lng === 0) && (
              <a
                href={`https://www.google.com/maps?q=${museum.lat},${museum.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-medium text-canal-blue hover:underline"
              >
                Preview this pin on Google Maps →
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Address & getting there</p>
            <Field label="Location heading">
              <input value={museum.practicalAddressHeading} onChange={(e) => update("practicalAddressHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Address">
              <textarea rows={2} value={museum.practicalAddress} onChange={(e) => update("practicalAddress", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Getting there / transit">
              <input value={museum.practicalGettingThere} onChange={(e) => update("practicalGettingThere", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Nearby Attractions section</p>
            <Field label="Section heading override (optional)" hint={`Leave blank to auto-generate "Other Attractions in ${museum.city || "{City}"}"`}>
              <input value={museum.nearbyHeadingOverride} onChange={(e) => update("nearbyHeadingOverride", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- HIGHLIGHTS TAB ---------------- */}
      {activeTab === "highlights" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">"What You'll See" section</p>
            <Field label="Eyebrow">
              <input value={museum.highlightsEyebrow} onChange={(e) => update("highlightsEyebrow", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Section heading (H2)">
              <input value={museum.highlightsHeading} onChange={(e) => update("highlightsHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={museum.highlightsSubheading} onChange={(e) => update("highlightsSubheading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Highlight cards">
              <RepeatableList<HighlightCard>
                items={museum.highlights}
                onChange={(highlights) => update("highlights", highlights)}
                newItem={() => ({ icon: "✨", title: "New Highlight", body: "" })}
                addLabel="+ Add highlight"
                renderItem={(card, upd) => (
                  <div className="grid gap-2 sm:grid-cols-[4rem_1fr]">
                    <input value={card.icon} onChange={(e) => upd({ ...card, icon: e.target.value })} placeholder="🖼️" className={inputClass} />
                    <div className="space-y-2">
                      <input value={card.title} onChange={(e) => upd({ ...card, title: e.target.value })} placeholder="Title" className={inputClass} />
                      <textarea rows={2} value={card.body} onChange={(e) => upd({ ...card, body: e.target.value })} placeholder="Body text" className={inputClass} />
                    </div>
                  </div>
                )}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">About section</p>
            <Field label="About heading">
              <input value={museum.aboutHeading} onChange={(e) => update("aboutHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="About body">
              <RichTextEditor value={museum.aboutBody} onChange={(html) => update("aboutBody", html)} />
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- PRACTICAL INFO TAB ---------------- */}
      {activeTab === "practical" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <Field label="Opening hours heading">
              <input value={museum.practicalHoursHeading} onChange={(e) => update("practicalHoursHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Opening hours">
              <RepeatableList<HoursRow>
                items={museum.practicalHours}
                onChange={(practicalHours) => update("practicalHours", practicalHours)}
                newItem={() => ({ range: "", time: "" })}
                addLabel="+ Add row"
                renderItem={(row, upd) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={row.range} onChange={(e) => upd({ ...row, range: e.target.value })} placeholder="e.g. Tuesday – Sunday" className={inputClass} />
                    <input value={row.time} onChange={(e) => upd({ ...row, time: e.target.value })} placeholder="e.g. 9:00 AM – 6:00 PM" className={inputClass} />
                  </div>
                )}
              />
            </Field>
            <Field label="Small note under the hours table" hint="e.g. closed dates, last-entry times, seasonal changes.">
              <input value={museum.practicalHoursNote} onChange={(e) => update("practicalHoursNote", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <Field label="“Best time to visit” heading">
              <input value={museum.practicalBestTimeHeading} onChange={(e) => update("practicalBestTimeHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="“Best time to visit” text">
              <RichTextEditor value={museum.practicalBestTimeBody} onChange={(html) => update("practicalBestTimeBody", html)} minHeight="5rem" />
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- TICKETS & FAQ TAB ---------------- */}
      {activeTab === "tickets" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Tour grid section copy</p>
            <p className="text-xs text-stone-500">
              The tour cards themselves (price, description, GetYourGuide link) are managed separately —{" "}
              {isNew ? "save this museum first, then " : ""}
              {!isNew && (
                <Link href={`/admin/museums/${museum.id}/tours`} className="font-medium text-canal-blue hover:underline">
                  manage Tours & Tickets →
                </Link>
              )}
              {isNew && "manage Tours & Tickets"}. This covers only the heading above them.
            </p>
            <Field label="Eyebrow">
              <input value={museum.toursEyebrow} onChange={(e) => update("toursEyebrow", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Heading (H2)">
              <input value={museum.toursHeading} onChange={(e) => update("toursHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={museum.toursSubheading} onChange={(e) => update("toursSubheading", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Price comparison table copy</p>
            <Field label="Eyebrow">
              <input value={museum.priceEyebrow} onChange={(e) => update("priceEyebrow", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Heading (H2)">
              <input value={museum.priceHeading} onChange={(e) => update("priceHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <RichTextEditor value={museum.priceSubheading} onChange={(html) => update("priceSubheading", html)} minHeight="4rem" />
            </Field>
            <Field label="Small note under the table">
              <textarea rows={2} value={museum.priceNote} onChange={(e) => update("priceNote", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">FAQ section</p>
            <p className="text-xs text-stone-500">
              The questions and answers are managed separately —{" "}
              {!isNew ? (
                <Link href={`/admin/museums/${museum.id}/faqs`} className="font-medium text-canal-blue hover:underline">
                  manage FAQs →
                </Link>
              ) : (
                "save this museum first, then manage FAQs"
              )}
              . This covers only the heading above them.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Eyebrow">
                <input value={museum.faqEyebrow} onChange={(e) => update("faqEyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading (H2)">
                <input value={museum.faqHeading} onChange={(e) => update("faqHeading", e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Bottom CTA banner</p>
            <Field label="Heading">
              <input value={museum.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Subtext">
              <input value={museum.ctaSubtext} onChange={(e) => update("ctaSubtext", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Button text">
              <input value={museum.ctaButtonText} onChange={(e) => update("ctaButtonText", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- SEO TAB ---------------- */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Search & Preview</p>
            <Field label="SEO title" hint="Shown as the blue link text in Google, and the browser tab. Leave blank to use the museum name.">
              <input value={museum.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className={inputClass} />
              <CharCounter length={museum.metaTitle.length} min={40} max={60} />
            </Field>
            <Field label="Meta description" hint="The gray snippet under the title in Google search results.">
              <textarea rows={3} value={museum.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className={inputClass} />
              <CharCounter length={museum.metaDescription.length} min={120} max={158} />
            </Field>
            <Field label="URL / slug">
              <input value={`/${museum.slug}`} disabled className={`${inputClass} bg-stone-100 text-stone-500`} />
            </Field>
            <Field label="Canonical URL (optional)" hint="Leave blank to auto-generate.">
              <input value={museum.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} className={inputClass} placeholder={`Leave blank to auto-generate: /${museum.slug}`} />
            </Field>
            <SeoPreview title={museum.metaTitle || museum.name} description={museum.metaDescription || museum.heroSubheading.replace(/<[^>]+>/g, "")} path={`/${museum.slug}`} />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Focus keyword</p>
            <Field label="Focus keyword">
              <input value={museum.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)} className={inputClass} placeholder="e.g. Louvre Museum tickets" />
            </Field>
            {focusChecklist && (
              <ul className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
                {focusChecklist.map((item) => (
                  <li key={item.label} className={`flex items-center gap-2 ${item.pass ? "text-green-700" : "text-amber-700"}`}>
                    <span>{item.pass ? "✓" : "!"}</span>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!isNew && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div>
                <p className="text-sm font-semibold text-stone-900">Search Engine Indexing &amp; Link Following</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  Currently{" "}
                  <span className={museum.noIndex ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                    {museum.noIndex ? "noindex" : "index"}
                  </span>
                  {", "}
                  <span className={museum.noFollow ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                    {museum.noFollow ? "nofollow" : "follow"}
                  </span>
                  . Managed from one place for every page on the site.
                </p>
              </div>
              <Link href="/admin/indexing" className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                Manage in Indexing →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SOCIAL MEDIA TAB ---------------- */}
      {activeTab === "social" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
            <p className="font-semibold text-stone-900">Open Graph &amp; Twitter/X Preview</p>
            <p className="text-xs text-stone-500">Leave blank to fall back to the hero's own title/description/image.</p>
            <Field label="Social title (optional)">
              <input value={museum.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Social description (optional)">
              <textarea rows={2} value={museum.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} className={inputClass} />
            </Field>
            <ImageUploadField label="Social share image (optional)" value={museum.ogImage} onChange={(url) => update("ogImage", url)} aspectRatio={1.91 / 1} />
          </div>
        </div>
      )}

      <SaveBar
        saving={saving}
        disabled={!isNew && !dirty}
        label={isNew ? "Create Museum" : "Save Changes"}
        onCancel={handleCancel}
        note={isNew ? "Tours and FAQs can be added once the museum is created." : "Changes save across all tabs at once."}
      />
    </form>
  );
}
