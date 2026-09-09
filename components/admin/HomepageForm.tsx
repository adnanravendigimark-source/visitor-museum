"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUploadField from "./ImageUploadField";
import RichTextEditor from "./RichTextEditor";
import RepeatableList from "./RepeatableList";
import SeoPreview from "./SeoPreview";
import CharCounter from "./CharCounter";
import ColorField from "./ColorField";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type {
  HomepageContent,
  NavLink,
  FooterColumn,
  FooterLink,
  HeroFeature,
  HighlightCard,
  FaqItem,
} from "@/lib/homepage";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";

const TABS = [
  { key: "content", label: "Content", icon: "📝" },
  { key: "seo", label: "SEO", icon: "🔍" },
  { key: "social", label: "Social Media", icon: "📣" },
  { key: "images", label: "Images", icon: "🖼️" },
  { key: "advanced", label: "Advanced SEO", icon: "⚙️" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// One entry per collapsible card on the Content tab — powers both the
// "Jump to section" quick nav and each card's default open/closed state.
const CONTENT_SECTIONS = [
  { id: "sec-navbar", label: "Navbar" },
  { id: "sec-hero", label: "Hero" },
  { id: "sec-grid", label: "Museums Grid" },
  { id: "sec-highlights", label: "Why Book With Us" },
  { id: "sec-blogteaser", label: "Blog Teaser" },
  { id: "sec-faq", label: "Homepage FAQ" },
  { id: "sec-ctabanner", label: "Bottom CTA Banner" },
  { id: "sec-404", label: "404 Page" },
  { id: "sec-footer", label: "Footer" },
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

// Collapsible when `id`+`onToggle` are supplied (the Content tab, which has
// enough sections to get overwhelming otherwise) — every other tab passes
// neither and just renders permanently open, exactly like before.
function SectionCard({
  id,
  title,
  description,
  children,
  tone = "default",
  open = true,
  onToggle,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "sitewide";
  open?: boolean;
  onToggle?: () => void;
}) {
  const collapsible = typeof onToggle === "function";
  const header = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-stone-900">{title}</p>
        {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {tone === "sitewide" && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
            Site-wide
          </span>
        )}
        {collapsible && (
          <span className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
            ▾
          </span>
        )}
      </div>
    </div>
  );
  return (
    <div id={id} className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6">
      {collapsible ? (
        <button type="button" onClick={onToggle} className="block w-full text-left">
          {header}
        </button>
      ) : (
        header
      )}
      {open && <div className="mt-4 space-y-5">{children}</div>}
    </div>
  );
}

export default function HomepageForm({ initial }: { initial: HomepageContent }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [content, setContent] = useState<HomepageContent>(initial);
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(initial), [content, initial]);

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setContent(initial);
    setError("");
  }
  // Only the first section starts open — everything else is one click (or
  // one "Jump to section" tap) away, so the tab doesn't read as one long
  // wall of fields.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [CONTENT_SECTIONS[0].id]: true,
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

  function update<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  function updateHeader(patch: Partial<HomepageContent["header"]>) {
    setContent((c) => ({ ...c, header: { ...c.header, ...patch } }));
    setSaved(false);
  }

  function updateFooter(patch: Partial<HomepageContent["footer"]>) {
    setContent((c) => ({ ...c, footer: { ...c.footer, ...patch } }));
    setSaved(false);
  }

  function updateTheme(patch: Partial<HomepageContent["theme"]>) {
    setContent((c) => ({ ...c, theme: { ...c.theme, ...patch } }));
    setSaved(false);
  }

  function updateGrid(patch: Partial<HomepageContent["sections"]["grid"]>) {
    setContent((c) => ({ ...c, sections: { ...c.sections, grid: { ...c.sections.grid, ...patch } } }));
    setSaved(false);
  }

  function updateHighlights(patch: Partial<HomepageContent["sections"]["highlights"]>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, highlights: { ...c.sections.highlights, ...patch } },
    }));
    setSaved(false);
  }

  function updateBlogTeaser(patch: Partial<HomepageContent["sections"]["blogTeaser"]>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, blogTeaser: { ...c.sections.blogTeaser, ...patch } },
    }));
    setSaved(false);
  }

  function updateFaq(patch: Partial<HomepageContent["sections"]["faq"]>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, faq: { ...c.sections.faq, ...patch } },
    }));
    setSaved(false);
  }

  function updateCtaBanner(patch: Partial<HomepageContent["sections"]["ctaBanner"]>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, ctaBanner: { ...c.sections.ctaBanner, ...patch } },
    }));
    setSaved(false);
  }

  function updateNotFound(patch: Partial<HomepageContent["sections"]["notFound"]>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, notFound: { ...c.sections.notFound, ...patch } },
    }));
    setSaved(false);
  }

  const focusChecklist = useMemo(() => {
    const kw = content.focusKeyword.trim().toLowerCase();
    if (!kw) return null;
    const plainSubheading = content.heroSubheading.replace(/<[^>]+>/g, "");
    const inTitle = (content.metaTitle || content.heroHeading).toLowerCase().includes(kw);
    const inH1 = content.heroHeading.toLowerCase().includes(kw);
    const inDescription = (content.metaDescription || plainSubheading).toLowerCase().includes(kw);
    const inUrl = true; // homepage is always "/"
    return [
      { label: "Appears in the SEO title", pass: inTitle },
      { label: "Appears in the H1 headline", pass: inH1 },
      { label: "Appears in the meta description", pass: inDescription },
      { label: "Homepage URL ( / )", pass: inUrl },
    ];
  }, [content.focusKeyword, content.metaTitle, content.heroHeading, content.metaDescription, content.heroSubheading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    setSaved(true);
    showToast("success", "Saved — live on the site now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-stone-200 bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-canal-blue text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Saved — live on the site now, no rebuild or hard refresh needed.
        </p>
      )}

      {/* ---------------- CONTENT TAB ---------------- */}
      {activeTab === "content" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Jump to section
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_SECTIONS.map((s) => (
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

          <SectionCard
            id="sec-navbar"
            title="Navbar"
            description="The menu bar at the top of every page. The logo image lives on the Images tab."
            tone="sitewide"
            open={!!openSections["sec-navbar"]}
            onToggle={() => toggleSection("sec-navbar")}
          >
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900">
              The first 4 ticket links shown in the header aren't listed here — they're generated
              automatically from whichever museums are marked <strong>Featured</strong> in{" "}
              <Link href="/admin/museums" className="underline">Museums &amp; Attractions</Link>, in the
              same order as that list. Feature, un-feature, or reorder museums there and the header
              updates on its own.
            </div>
            <Field label="Other nav links (shown after the 4 museum links)" hint="Contact isn't shown in the header nav by design — it's still reachable from the footer and every page.">
              <RepeatableList<NavLink>
                items={content.header.navLinks}
                onChange={(navLinks) => updateHeader({ navLinks })}
                newItem={() => ({ label: "New Link", href: "/" })}
                addLabel="+ Add nav link"
                renderItem={(link, upd) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={link.label} onChange={(e) => upd({ ...link, label: e.target.value })} placeholder="Label" className={inputClass} />
                    <input value={link.href} onChange={(e) => upd({ ...link, href: e.target.value })} placeholder="/about" className={inputClass} />
                  </div>
                )}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Button text">
                <input value={content.header.ctaText} onChange={(e) => updateHeader({ ctaText: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Button link">
                <input value={content.header.ctaHref} onChange={(e) => updateHeader({ ctaHref: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label={'Site-wide "Book Now" button text'} hint="Used on every tour card, the mobile sticky bar, and the blog sidebar.">
              <input value={content.header.bookNowText} onChange={(e) => updateHeader({ bookNowText: e.target.value })} className={inputClass} />
            </Field>
          </SectionCard>

          <SectionCard
            id="sec-hero"
            title="Hero"
            description="The full-width banner at the top of the homepage."
            open={!!openSections["sec-hero"]}
            onToggle={() => toggleSection("sec-hero")}
          >
            <Field label="Hero badge (small pill above the headline)">
              <input value={content.heroBadge} onChange={(e) => update("heroBadge", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hero headline (H1)">
              <textarea rows={2} value={content.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hero subheading">
              <RichTextEditor value={content.heroSubheading} onChange={(html) => update("heroSubheading", html)} minHeight="4rem" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Primary button text">
                <input value={content.heroCtaPrimaryText} onChange={(e) => update("heroCtaPrimaryText", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Primary button link">
                <input value={content.heroCtaPrimaryHref} onChange={(e) => update("heroCtaPrimaryHref", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Feature strip (the floating card of 4 items below the hero text)">
              <RepeatableList<HeroFeature>
                items={content.heroFeatures}
                onChange={(heroFeatures) => update("heroFeatures", heroFeatures)}
                newItem={() => ({ title: "New Feature", subtitle: "" })}
                addLabel="+ Add feature"
                renderItem={(feature, upd) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={feature.title} onChange={(e) => upd({ ...feature, title: e.target.value })} placeholder="Title" className={inputClass} />
                    <input value={feature.subtitle} onChange={(e) => upd({ ...feature, subtitle: e.target.value })} placeholder="Subtitle" className={inputClass} />
                  </div>
                )}
              />
            </Field>
          </SectionCard>

          <SectionCard
            id="sec-grid"
            title="Museums Grid section"
            description="The eyebrow + heading + intro text directly above the grid of museum & attraction cards. The cards themselves come from the Museums admin section."
            open={!!openSections["sec-grid"]}
            onToggle={() => toggleSection("sec-grid")}
          >
            <Field label="Eyebrow">
              <input value={content.sections.grid.eyebrow} onChange={(e) => updateGrid({ eyebrow: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Section heading (H2)">
              <input value={content.sections.grid.heading} onChange={(e) => updateGrid({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={content.sections.grid.subheading} onChange={(e) => updateGrid({ subheading: e.target.value })} className={inputClass} />
            </Field>
          </SectionCard>

          <SectionCard
            id="sec-highlights"
            title="“Cultural Journey & Adventure” section"
            description="The eyebrow, heading, intro text, and 4 feature cards shown in the 'Plan Your Museum Adventure' banner below the museums grid."
            open={!!openSections["sec-highlights"]}
            onToggle={() => toggleSection("sec-highlights")}
          >
            <Field label="Eyebrow">
              <input value={content.sections.highlights.eyebrow} onChange={(e) => updateHighlights({ eyebrow: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Section heading (H2)">
              <input value={content.sections.highlights.heading} onChange={(e) => updateHighlights({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={content.sections.highlights.subheading} onChange={(e) => updateHighlights({ subheading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Trust cards">
              <RepeatableList<HighlightCard>
                items={content.sections.highlights.cards}
                onChange={(cards) => updateHighlights({ cards })}
                newItem={() => ({ icon: "✨", title: "New Card", body: "" })}
                addLabel="+ Add card"
                renderItem={(card, upd) => (
                  <div className="grid gap-2 sm:grid-cols-[4rem_1fr]">
                    <input value={card.icon} onChange={(e) => upd({ ...card, icon: e.target.value })} placeholder="🎟️" className={inputClass} />
                    <div className="space-y-2">
                      <input value={card.title} onChange={(e) => upd({ ...card, title: e.target.value })} placeholder="Title" className={inputClass} />
                      <textarea rows={2} value={card.body} onChange={(e) => upd({ ...card, body: e.target.value })} placeholder="Body text" className={inputClass} />
                    </div>
                  </div>
                )}
              />
            </Field>
          </SectionCard>

          <SectionCard
            id="sec-blogteaser"
            title="Blog Teaser section"
            description="The 'Popular Articles & Guides' section showing your 3 latest blog posts on the homepage."
            open={!!openSections["sec-blogteaser"]}
            onToggle={() => toggleSection("sec-blogteaser")}
          >
            <Field label="Eyebrow">
              <input value={content.sections.blogTeaser.eyebrow} onChange={(e) => updateBlogTeaser({ eyebrow: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Section heading (H2)">
              <input value={content.sections.blogTeaser.heading} onChange={(e) => updateBlogTeaser({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={content.sections.blogTeaser.subheading} onChange={(e) => updateBlogTeaser({ subheading: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={'"View all" button text'}>
                <input value={content.sections.blogTeaser.viewAllText} onChange={(e) => updateBlogTeaser({ viewAllText: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Per-article link text">
                <input value={content.sections.blogTeaser.readArticleText} onChange={(e) => updateBlogTeaser({ readArticleText: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <p className={hintClass}>
              Only shows once you have at least one published blog post — manage posts from{" "}
              <Link href="/admin/posts" className="underline">Posts</Link>.
            </p>
          </SectionCard>

          <SectionCard
            id="sec-faq"
            title="Homepage FAQ"
            description="General trust & booking questions shown near the bottom of the homepage — separate from each museum's own FAQ."
            open={!!openSections["sec-faq"]}
            onToggle={() => toggleSection("sec-faq")}
          >
            <Field label="Eyebrow">
              <input value={content.sections.faq.eyebrow} onChange={(e) => updateFaq({ eyebrow: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Section heading (H2)">
              <input value={content.sections.faq.heading} onChange={(e) => updateFaq({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Subheading">
              <textarea rows={2} value={content.sections.faq.subheading} onChange={(e) => updateFaq({ subheading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Questions" hint="Hidden entirely if this list is empty.">
              <RepeatableList<FaqItem>
                items={content.sections.faq.items}
                onChange={(items) => updateFaq({ items })}
                newItem={() => ({ question: "New question?", answer: "" })}
                addLabel="+ Add question"
                renderItem={(item, upd) => (
                  <div className="space-y-2">
                    <input value={item.question} onChange={(e) => upd({ ...item, question: e.target.value })} placeholder="Question" className={inputClass} />
                    <RichTextEditor value={item.answer} onChange={(html) => upd({ ...item, answer: html })} minHeight="3rem" />
                  </div>
                )}
              />
            </Field>
          </SectionCard>

          <SectionCard
            id="sec-ctabanner"
            title="Bottom CTA banner"
            description="The dark call-to-action banner at the very end of the homepage, right before the footer."
            open={!!openSections["sec-ctabanner"]}
            onToggle={() => toggleSection("sec-ctabanner")}
          >
            <Field label="Heading">
              <input value={content.sections.ctaBanner.heading} onChange={(e) => updateCtaBanner({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Subtext">
              <input value={content.sections.ctaBanner.subtext} onChange={(e) => updateCtaBanner({ subtext: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Button text">
                <input value={content.sections.ctaBanner.buttonText} onChange={(e) => updateCtaBanner({ buttonText: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Button link">
                <input value={content.sections.ctaBanner.buttonHref} onChange={(e) => updateCtaBanner({ buttonHref: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="sec-404"
            title="404 (page not found)"
            description="Shown when a visitor lands on a broken or missing link."
            open={!!openSections["sec-404"]}
            onToggle={() => toggleSection("sec-404")}
          >
            <Field label="Heading">
              <input value={content.sections.notFound.heading} onChange={(e) => updateNotFound({ heading: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Body text">
              <textarea rows={2} value={content.sections.notFound.body} onChange={(e) => updateNotFound({ body: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Primary button text">
                <input value={content.sections.notFound.primaryButtonText} onChange={(e) => updateNotFound({ primaryButtonText: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Primary button link">
                <input value={content.sections.notFound.primaryButtonHref} onChange={(e) => updateNotFound({ primaryButtonHref: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Secondary button text">
                <input value={content.sections.notFound.secondaryButtonText} onChange={(e) => updateNotFound({ secondaryButtonText: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Secondary button link">
                <input value={content.sections.notFound.secondaryButtonHref} onChange={(e) => updateNotFound({ secondaryButtonHref: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="sec-footer"
            title="Footer"
            description="Shown at the bottom of every page."
            tone="sitewide"
            open={!!openSections["sec-footer"]}
            onToggle={() => toggleSection("sec-footer")}
          >
            <Field label="Tagline / disclosure text" hint="Supports bold and links.">
              <RichTextEditor value={content.footer.tagline} onChange={(html) => updateFooter({ tagline: html })} minHeight="4rem" />
            </Field>
            <Field label="Link columns">
              <RepeatableList<FooterColumn>
                items={content.footer.columns}
                onChange={(columns) => updateFooter({ columns })}
                newItem={() => ({ title: "New Column", links: [] })}
                addLabel="+ Add column"
                renderItem={(col, upd) => (
                  <div className="space-y-2">
                    <input value={col.title} onChange={(e) => upd({ ...col, title: e.target.value })} placeholder="Column title" className={inputClass} />
                    <RepeatableList<FooterLink>
                      items={col.links}
                      onChange={(links) => upd({ ...col, links })}
                      newItem={() => ({ label: "New link", href: "/" })}
                      addLabel="+ Add link"
                      renderItem={(link, updLink) => (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input value={link.label} onChange={(e) => updLink({ ...link, label: e.target.value })} placeholder="Label" className={inputClass} />
                          <input value={link.href} onChange={(e) => updLink({ ...link, href: e.target.value })} placeholder="/about" className={inputClass} />
                        </div>
                      )}
                    />
                  </div>
                )}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Address heading">
                <input value={content.footer.addressHeading} onChange={(e) => updateFooter({ addressHeading: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Copyright line" hint="Shown after the auto-inserted year.">
                <input value={content.footer.copyrightText} onChange={(e) => updateFooter({ copyrightText: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Address line 1">
                <input value={content.footer.addressLine1} onChange={(e) => updateFooter({ addressLine1: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Address line 2">
                <input value={content.footer.addressLine2} onChange={(e) => updateFooter({ addressLine2: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ---------------- SEO TAB ---------------- */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          <SectionCard title="Search & Preview" description="Controls exactly what Google shows for the homepage.">
            <Field label="SEO title" hint="Shown as the blue link text in Google, and the browser tab. Leave blank to use the site-wide default.">
              <input value={content.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className={inputClass} />
              <CharCounter length={content.metaTitle.length} min={40} max={60} />
            </Field>
            <Field label="Meta description" hint="The gray snippet under the title in Google search results.">
              <textarea rows={3} value={content.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className={inputClass} />
              <CharCounter length={content.metaDescription.length} min={120} max={158} />
            </Field>
            <Field label="URL / slug" hint="The homepage always lives at the root URL — this can't be changed.">
              <input value="/" disabled className={`${inputClass} bg-stone-100 text-stone-500`} />
            </Field>
            <Field label="Canonical URL (optional)" hint="Leave blank to auto-generate from the site's own URL.">
              <input value={content.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} className={inputClass} placeholder="Leave blank to auto-generate: /" />
            </Field>
            <SeoPreview title={content.metaTitle || content.heroHeading} description={content.metaDescription || content.heroSubheading.replace(/<[^>]+>/g, "")} path="/" />
          </SectionCard>

          <SectionCard title="Indexing & Link Following">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div>
                <p className="text-sm font-semibold text-stone-900">Search Engine Indexing &amp; Link Following</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  Currently{" "}
                  <span className={content.noIndex ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                    {content.noIndex ? "noindex" : "index"}
                  </span>
                  {", "}
                  <span className={content.noFollow ? "font-medium text-amber-700" : "font-medium text-green-700"}>
                    {content.noFollow ? "nofollow" : "follow"}
                  </span>
                  . Managed from one place for every page on the site.
                </p>
              </div>
              <Link href="/admin/indexing" className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                Manage in Indexing →
              </Link>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ---------------- SOCIAL MEDIA TAB ---------------- */}
      {activeTab === "social" && (
        <div className="space-y-5">
          <SectionCard title="Open Graph &amp; Twitter/X Preview" description="Used when the homepage is shared on Facebook, WhatsApp, iMessage, Twitter/X, etc. Leave blank to fall back to the hero's own title/description/image.">
            <Field label="Social title (optional)">
              <input value={content.ogTitle} onChange={(e) => update("ogTitle", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Social description (optional)">
              <textarea rows={2} value={content.ogDescription} onChange={(e) => update("ogDescription", e.target.value)} className={inputClass} />
            </Field>
            <ImageUploadField label="Social share image (optional)" value={content.ogImage} onChange={(url) => update("ogImage", url)} aspectRatio={1.91 / 1} />

            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="aspect-[1.91/1] w-full bg-stone-100">
                {(content.ogImage || content.heroImage) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={content.ogImage || content.heroImage} alt="Social preview" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="bg-stone-50 p-3">
                <p className="truncate text-xs uppercase tracking-wide text-stone-400">visit-museums.com</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-stone-900">{content.ogTitle || content.metaTitle || content.heroHeading}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{(content.ogDescription || content.metaDescription || content.heroSubheading).replace(/<[^>]+>/g, "")}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ---------------- IMAGES TAB ---------------- */}
      {activeTab === "images" && (
        <div className="space-y-5">
          <SectionCard title="Logo" description="Overrides the site logo everywhere it appears (navbar + footer)." tone="sitewide">
            <ImageUploadField label="Logo image (leave blank to use the default)" value={content.header.logoImage} onChange={(url) => updateHeader({ logoImage: url })} />
            <Field label="Logo alt text">
              <input value={content.header.logoAlt} onChange={(e) => updateHeader({ logoAlt: e.target.value })} className={inputClass} />
            </Field>
          </SectionCard>

          <SectionCard title="Hero photo" description="Used as the homepage's main banner image and as the fallback social share image.">
            <ImageUploadField label="Hero background photo" value={content.heroImage} onChange={(url) => update("heroImage", url)} aspectRatio={16 / 9} />
            <Field label="Hero photo alt text">
              <input value={content.heroImageAlt} onChange={(e) => update("heroImageAlt", e.target.value)} className={inputClass} />
            </Field>
          </SectionCard>
        </div>
      )}

      {/* ---------------- ADVANCED SEO TAB ---------------- */}
      {activeTab === "advanced" && (
        <div className="space-y-5">
          <SectionCard title="Focus keyword" description="The main phrase you want the homepage to rank for. Purely a writing aid — nothing here is sent to Google.">
            <Field label="Focus keyword">
              <input value={content.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)} className={inputClass} placeholder="e.g. visit museums" />
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
          </SectionCard>

          <SectionCard title="Brand colors" description="Changes these colors everywhere they're used across the whole site — buttons, links, hero background. Leave a field blank to keep the default.">
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField label="Primary (buttons)" value={content.theme.primary} fallback="#1F2937" onChange={(hex) => updateTheme({ primary: hex })} />
              <ColorField label="Secondary (links, accents)" value={content.theme.secondary} fallback="#B08D57" onChange={(hex) => updateTheme({ secondary: hex })} />
              <ColorField label="Dark (hero background)" value={content.theme.dark} fallback="#0F1419" onChange={(hex) => updateTheme({ dark: hex })} />
            </div>
          </SectionCard>

          <SectionCard title="Schema, sitemap &amp; robots" description="Technical SEO that's already wired up site-wide — shown here for visibility, not editable per-page.">
            <ul className="space-y-2 text-sm text-stone-700">
              <li>✓ Organization + WebSite structured data on every page (see the page source).</li>
              <li>✓ TouristAttraction structured data for every museum page.</li>
              <li>
                ✓ <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">/sitemap.xml</code> is generated automatically from every published museum, page, and post.
              </li>
              <li>
                ✓ <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">/robots.txt</code> is generated automatically and respects each page's Index/Follow setting.
              </li>
            </ul>
            <p className="text-xs text-stone-500">
              Per-page indexing is controlled from the <Link href="/admin/indexing" className="underline">Indexing</Link> tab.
            </p>
          </SectionCard>
        </div>
      )}

      <SaveBar
        saving={saving}
        disabled={!dirty}
        onCancel={handleCancel}
        note="Changes save across all tabs at once."
      />
    </form>
  );
}
