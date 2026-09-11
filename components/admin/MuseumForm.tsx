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
import type { Museum, HighlightCard, HoursRow, TourRecord } from "@/lib/museums";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";

// One entry per section card, in the same order those sections actually
// appear on the live museum page (hero → tickets → highlights → practical
// info → price table → other attractions → FAQ → CTA), with the
// non-visual identity/SEO/social sections bookending the flow. Powers both
// the "Jump to section" quick nav and each card's default open/closed
// state. Other Attractions here is just a summary card + link — the
// attractions themselves are managed on their own screen (see
// /admin/attractions/[museumId]), same relationship as Tickets Section
// has with Tours & Tickets.
const SECTIONS = [
  { id: "sec-basics", label: "Museum Basics" },
  { id: "sec-card", label: "Homepage Grid Card" },
  { id: "sec-hero", label: "Hero" },
  { id: "sec-tickets", label: "Tickets Section" },
  { id: "sec-highlights", label: "Highlights & About" },
  { id: "sec-practical", label: "Practical Info" },
  { id: "sec-price", label: "Price Comparison Table" },
  { id: "sec-attractions", label: "Other Attractions" },
  { id: "sec-faq", label: "FAQ Section" },
  { id: "sec-cta", label: "Bottom CTA Banner" },
  { id: "sec-seo", label: "SEO" },
  { id: "sec-social", label: "Social Media" },
] as const;

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

// Collapsible section card — same pattern as the Homepage editor's Content
// tab, so the whole form is one continuous scroll instead of tabs.
function SectionCard({
  id,
  title,
  description,
  children,
  open,
  onToggle,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div id={id} className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6">
      <button type="button" onClick={onToggle} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-stone-900">{title}</p>
            {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
          </div>
          <span className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
            ▾
          </span>
        </div>
      </button>
      {open && <div className="mt-4 space-y-5">{children}</div>}
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

export default function MuseumForm({
  initial,
  isNew,
  tours = [],
  otherAttractionsCount = 0,
}: {
  initial: Museum;
  isNew: boolean;
  tours?: TourRecord[];
  otherAttractionsCount?: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [museum, setMuseum] = useState<Museum>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  // Only the first section starts open — everything else is one click (or
  // one "Jump to section" tap) away, so the page doesn't read as one huge
  // wall of fields.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [SECTIONS[0].id]: true,
  });

  function toggleSection(id: string) {
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));
  }

  function jumpToSection(id: string) {
    setOpenSections((s) => ({ ...s, [id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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
      setError("A real latitude/longitude is required for the page's map/geo structured data — see the Practical Info section.");
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
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Jump to section</p>
        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpToSection(s.id)}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!isNew && (
        <div className="flex items-center justify-end rounded-xl border border-stone-200 bg-stone-50 p-4">
          <Link href={`/${museum.slug}`} target="_blank" className="shrink-0 text-xs font-medium text-canal-blue hover:underline">
            View live page →
          </Link>
        </div>
      )}

      {/* ---------------- MUSEUM BASICS ---------------- */}
      <SectionCard
        id="sec-basics"
        title="Museum Basics"
        description="Core identity — not tied to one visual section, used across the whole page and site."
        open={!!openSections["sec-basics"]}
        onToggle={() => toggleSection("sec-basics")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Museum / attraction name">
            <input required value={museum.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Louvre Museum" />
          </Field>
          <Field label="Currency symbol" hint='e.g. "€", "CHF ", "$"'>
            <input value={museum.currencySymbol} onChange={(e) => update("currencySymbol", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City">
            <input required value={museum.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Country">
            <input required value={museum.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Rating" hint="Shown as the ★ rating in this museum's own page hero, just under the subheading (0–5).">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={museum.rating ?? 4.7}
              onChange={(e) => update("rating", e.target.value === "" ? undefined : Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Review count" hint='Free text, e.g. "10.2k" or "1,204" — shown next to the rating in the hero.'>
            <input value={museum.reviewsCount ?? ""} onChange={(e) => update("reviewsCount", e.target.value)} className={inputClass} placeholder="e.g. 10.2k" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={!!museum.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-stone-300" />
          Featured (eligible for the homepage's 3-museum spotlight, in sort order — every museum,
          featured or not, is always browsable on the full /museums page)
        </label>
      </SectionCard>

      {/* ---------------- HOMEPAGE GRID CARD ---------------- */}
      <SectionCard
        id="sec-card"
        title="Homepage Grid Card"
        description="How this museum appears in the grid of cards on the homepage."
        open={!!openSections["sec-card"]}
        onToggle={() => toggleSection("sec-card")}
      >
        <ImageUploadField label="Card photo" value={museum.cardImage} onChange={(url) => update("cardImage", url)} aspectRatio={4 / 3} />
        <Field label="Card photo alt text">
          <input value={museum.cardImageAlt} onChange={(e) => update("cardImageAlt", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Card tagline" hint="Short line shown under the museum name on the grid card.">
          <input value={museum.cardTagline} onChange={(e) => update("cardTagline", e.target.value)} className={inputClass} />
        </Field>
      </SectionCard>

      {/* ---------------- HERO ---------------- */}
      <SectionCard
        id="sec-hero"
        title="Hero"
        description="The full-width banner at the top of this museum's page."
        open={!!openSections["sec-hero"]}
        onToggle={() => toggleSection("sec-hero")}
      >
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
        <Field
          label="Trust badge (next to the rating in the hero)"
          hint={`Shown next to the ★ rating. Keep this honest — Visit Museums is an independent affiliate guide, not the museum's official ticket seller, so avoid the word "Official" here.`}
        >
          <input
            value={museum.heroTrustBadge}
            onChange={(e) => update("heroTrustBadge", e.target.value)}
            className={inputClass}
            placeholder="e.g. Authorized Ticket Partner"
          />
        </Field>
      </SectionCard>

      {/* ---------------- TICKETS SECTION ---------------- */}
      <SectionCard
        id="sec-tickets"
        title="Tickets Section"
        description="The heading above the ticket cards. The tickets themselves are managed from the Tours & Tickets section in the sidebar."
        open={!!openSections["sec-tickets"]}
        onToggle={() => toggleSection("sec-tickets")}
      >
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">
              {tours.length} {tours.length === 1 ? "ticket" : "tickets"} for this museum
            </p>
            <p className="mt-0.5 text-xs text-stone-500">Edit price, description, includes, image, and booking link per ticket.</p>
          </div>
          {isNew ? (
            <span className="shrink-0 text-xs text-stone-400">Save this museum first</span>
          ) : (
            <Link
              href={`/admin/museums/${museum.id}/tours`}
              className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Manage Tickets →
            </Link>
          )}
        </div>

        <Field label="Eyebrow">
          <input value={museum.toursEyebrow} onChange={(e) => update("toursEyebrow", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Heading (H2)">
          <input value={museum.toursHeading} onChange={(e) => update("toursHeading", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Subheading">
          <textarea rows={2} value={museum.toursSubheading} onChange={(e) => update("toursSubheading", e.target.value)} className={inputClass} />
        </Field>
      </SectionCard>

      {/* ---------------- HIGHLIGHTS & ABOUT ---------------- */}
      <SectionCard
        id="sec-highlights"
        title="Highlights & About"
        description="The 'What You'll See' section and the About block that follows it."
        open={!!openSections["sec-highlights"]}
        onToggle={() => toggleSection("sec-highlights")}
      >
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
        <div className="border-t border-stone-100 pt-5">
          <Field label="About heading">
            <input value={museum.aboutHeading} onChange={(e) => update("aboutHeading", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="About body">
          <RichTextEditor value={museum.aboutBody} onChange={(html) => update("aboutBody", html)} />
        </Field>
      </SectionCard>

      {/* ---------------- PRACTICAL INFO ---------------- */}
      <SectionCard
        id="sec-practical"
        title="Practical Info"
        description="Hours, best time to visit, address, and the coordinates used for the page's map/geo structured data."
        open={!!openSections["sec-practical"]}
        onToggle={() => toggleSection("sec-practical")}
      >
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

        <div className="border-t border-stone-100 pt-5">
          <Field label="“Best time to visit” heading">
            <input value={museum.practicalBestTimeHeading} onChange={(e) => update("practicalBestTimeHeading", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="“Best time to visit” text">
          <RichTextEditor value={museum.practicalBestTimeBody} onChange={(html) => update("practicalBestTimeBody", html)} minHeight="5rem" />
        </Field>

        <div className="border-t border-stone-100 pt-5">
          <Field label="Address heading">
            <input value={museum.practicalAddressHeading} onChange={(e) => update("practicalAddressHeading", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Address">
          <textarea rows={2} value={museum.practicalAddress} onChange={(e) => update("practicalAddress", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Getting there / transit">
          <input value={museum.practicalGettingThere} onChange={(e) => update("practicalGettingThere", e.target.value)} className={inputClass} />
        </Field>

        <div className="border-t border-stone-100 pt-5">
          <p className="mb-2 text-xs text-stone-500">
            Used for this page's GeoCoordinates structured data (helps search engines place it on a map). Get exact
            coordinates from Google Maps: right-click the pin → click the coordinates to copy them.
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
              className="mt-2 inline-block text-xs font-medium text-canal-blue hover:underline"
            >
              Preview this pin on Google Maps →
            </a>
          )}
        </div>
      </SectionCard>

      {/* ---------------- PRICE COMPARISON TABLE ---------------- */}
      <SectionCard
        id="sec-price"
        title="Price Comparison Table"
        description="The copy above the ticket comparison table. Rows come from the tours themselves."
        open={!!openSections["sec-price"]}
        onToggle={() => toggleSection("sec-price")}
      >
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
      </SectionCard>

      {/* ---------------- OTHER ATTRACTIONS ---------------- */}
      <SectionCard
        id="sec-attractions"
        title="Other Attractions"
        description={`Extra attraction cards shown right below this museum's own Tours & Tickets — same card style, hand-picked and managed per museum, e.g. other things to do in ${museum.city || "this city"}.`}
        open={!!openSections["sec-attractions"]}
        onToggle={() => toggleSection("sec-attractions")}
      >
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">
              {otherAttractionsCount} {otherAttractionsCount === 1 ? "attraction" : "attractions"} for this museum
            </p>
            <p className="mt-0.5 text-xs text-stone-500">Edit title, description, image, price, and booking link per attraction.</p>
          </div>
          {isNew ? (
            <span className="shrink-0 text-xs text-stone-400">Save this museum first</span>
          ) : (
            <Link
              href={`/admin/attractions/${museum.id}`}
              className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Manage Other Attractions →
            </Link>
          )}
        </div>
      </SectionCard>

      {/* ---------------- FAQ SECTION ---------------- */}
      <SectionCard
        id="sec-faq"
        title="FAQ Section"
        description="The heading above the FAQ list. The questions and answers themselves are managed separately."
        open={!!openSections["sec-faq"]}
        onToggle={() => toggleSection("sec-faq")}
      >
        <p className="text-xs text-stone-500">
          {!isNew ? (
            <Link href={`/admin/museums/${museum.id}/faqs`} className="font-medium text-canal-blue hover:underline">
              Manage FAQs →
            </Link>
          ) : (
            "Save this museum first, then manage FAQs."
          )}
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Eyebrow">
            <input value={museum.faqEyebrow} onChange={(e) => update("faqEyebrow", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Heading (H2)">
            <input value={museum.faqHeading} onChange={(e) => update("faqHeading", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </SectionCard>

      {/* ---------------- BOTTOM CTA BANNER ---------------- */}
      <SectionCard
        id="sec-cta"
        title="Bottom CTA Banner"
        description="The final call-to-action banner at the end of the page."
        open={!!openSections["sec-cta"]}
        onToggle={() => toggleSection("sec-cta")}
      >
        <Field label="Heading">
          <input value={museum.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Subtext">
          <input value={museum.ctaSubtext} onChange={(e) => update("ctaSubtext", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Button text">
          <input value={museum.ctaButtonText} onChange={(e) => update("ctaButtonText", e.target.value)} className={inputClass} />
        </Field>
      </SectionCard>

      {/* ---------------- SEO ---------------- */}
      <SectionCard
        id="sec-seo"
        title="SEO"
        description="Controls exactly what Google shows for this museum's page."
        open={!!openSections["sec-seo"]}
        onToggle={() => toggleSection("sec-seo")}
      >
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

        <div className="border-t border-stone-100 pt-5">
          <Field label="Focus keyword">
            <input value={museum.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)} className={inputClass} placeholder="e.g. Louvre Museum tickets" />
          </Field>
        </div>
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
      </SectionCard>

      {/* ---------------- SOCIAL MEDIA ---------------- */}
      <SectionCard
        id="sec-social"
        title="Social Media"
        description="Open Graph & Twitter/X preview — leave blank to fall back to the hero's own title/description/image."
        open={!!openSections["sec-social"]}
        onToggle={() => toggleSection("sec-social")}
      >
        <Field label="Social title (optional)">
          <input value={museum.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Social description (optional)">
          <textarea rows={2} value={museum.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} className={inputClass} />
        </Field>
        <ImageUploadField label="Social share image (optional)" value={museum.ogImage} onChange={(url) => update("ogImage", url)} aspectRatio={1.91 / 1} />
      </SectionCard>

      <SaveBar
        saving={saving}
        disabled={!isNew && !dirty}
        label={isNew ? "Create Museum" : "Save Changes"}
        onCancel={handleCancel}
        note={isNew ? "Tours and FAQs can be added once the museum is created." : "Changes save across every section at once."}
      />
    </form>
  );
}
