"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";
import TiptapArticleEditor from "./TiptapArticleEditor";
import SeoFieldsCard from "./SeoFieldsCard";
import SeoPreview from "./SeoPreview";
import SocialPreview from "./SocialPreview";
import CharCounter from "./CharCounter";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { Post } from "@/lib/posts";
import type { Tour } from "@/lib/museums";
import type { PostRedirectRow } from "@/lib/redirects";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";
const hintClass = "mt-1 text-xs text-stone-500";

const TABS = [
  { key: "content", label: "Content", icon: "📝" },
  { key: "seo", label: "SEO & Preview", icon: "🔍" },
  { key: "advanced", label: "Advanced SEO", icon: "⚙️" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Auto-derives the listing-card excerpt straight from the article body
// instead of making the admin type one out separately — roughly enough
// text for 3 lines, cut on a word boundary with a trailing "…" so it never
// looks abruptly chopped off mid-word.
function excerptFromContent(html: string, maxChars = 200): string {
  const text = stripHtml(html);
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

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

export default function PostForm({
  initial,
  isNew,
  tours,
  incomingRedirects = [],
}: {
  initial: Post;
  isNew: boolean;
  tours: (Tour & { museumName: string })[];
  // Old URLs that already redirect to this post — shown for visibility in
  // the Advanced SEO tab. Empty for a brand-new post.
  incomingRedirects?: PostRedirectRow[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [post, setPost] = useState<Post>(() => {
    // If it's a new post, ensure date is initialized to the current local date YYYY-MM-DD
    if (isNew) {
      const today = new Date().toLocaleDateString("en-CA");
      return { ...initial, date: today, updatedAt: today };
    }
    return initial;
  });
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof Post>(key: K, value: Post[K]) {
    setPost((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setSaved(false);
  }

  function updateTitle(value: string) {
    update("title", value);
    if (isNew && !slugTouched) {
      update("slug", slugify(value));
    }
  }

  const wordCount = useMemo(() => stripHtml(post.content).split(/\s+/).filter(Boolean).length, [post.content]);

  // The listing-card excerpt is no longer a field the admin fills in — it's
  // always derived fresh from whatever the article body currently says.
  const autoExcerpt = useMemo(() => excerptFromContent(post.content), [post.content]);

  const slugChanged = !isNew && post.slug !== initial.slug;

  const focusChecklist = useMemo(() => {
    const kw = post.focusKeyword.trim().toLowerCase();
    if (!kw) return null;
    const bodyText = stripHtml(post.content);
    return [
      { label: "Appears in the SEO title", pass: (post.metaTitle || post.title).toLowerCase().includes(kw) },
      { label: "Appears in the H1 title", pass: post.title.toLowerCase().includes(kw) },
      { label: "Appears in the meta description", pass: (post.metaDescription || autoExcerpt).toLowerCase().includes(kw) },
      { label: "Appears in the URL slug", pass: post.slug.toLowerCase().includes(kw.replace(/\s+/g, "-")) },
      { label: "Appears early in the article", pass: bodyText.slice(0, 300).toLowerCase().includes(kw) },
      { label: "Appears in the hero image alt text", pass: post.imageAlt.toLowerCase().includes(kw) },
      { label: "Article is at least 300 words", pass: wordCount >= 300 },
    ];
  }, [post.focusKeyword, post.metaTitle, post.title, post.metaDescription, autoExcerpt, post.slug, post.content, post.imageAlt, wordCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isNew ? "/api/admin/posts" : `/api/admin/posts/${initial.slug}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, excerpt: autoExcerpt }),
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
    if (isNew) {
      showToast("success", "Post published.");
      router.push("/admin/posts");
      router.refresh();
    } else {
      setSaved(true);
      showToast("success", "Saved — live on the site now.");
      // Slug may have changed — the edit URL for this post is now
      // different, so route there instead of just router.refresh()-ing
      // the old (now-redirecting) URL.
      if (post.slug !== initial.slug) {
        router.push(`/admin/posts/${post.slug}`);
      }
      router.refresh();
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    router.push("/admin/posts");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Tab bar — sticky so it (and the "View Post" shortcut) stay
            reachable while scrolling a long article instead of only
            living at the very top of the page. */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white/95 p-1.5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-1">
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
          {!isNew && (
            <a
              href={`/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open this post on the live site"
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
            >
              View Post ↗
            </a>
          )}
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
            <SectionCard title="Basics" description="What readers see as the title, and where the page lives.">
              <Field label="Title (H1 on the page)">
                <input
                  required
                  value={post.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. How to Skip the Line at the Louvre"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="URL slug"
                  hint={
                    isNew
                      ? "Auto-fills from the title. Page will live at /" + (post.slug || "…")
                      : slugChanged
                        ? "Changing this will automatically redirect the old address (/" + initial.slug + ") to the new one, so links and search rankings aren't lost."
                        : "Safe to change — the old address will automatically redirect to the new one."
                  }
                >
                  <input
                    required
                    value={post.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      update("slug", slugify(e.target.value));
                    }}
                    className={`${inputClass} ${slugChanged ? "border-amber-400 bg-amber-50" : ""}`}
                    placeholder="brunelleschi-dome-climb-florence-guide"
                  />
                </Field>
                <Field label="Category" hint="Controls the category badge and sidebar category filters.">
                  <input
                    required
                    value={post.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Museum Guides, Ticket Tips, Skip-the-Line"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Author" hint="e.g. Visit Museums Editorial Team">
                  <input
                    value={post.author || ""}
                    onChange={(e) => update("author", e.target.value)}
                    className={inputClass}
                    placeholder="Emma Rossi"
                  />
                </Field>
                <Field label="Publish date" hint="Auto-detected from today's date on creation.">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={post.date}
                      onChange={(e) => update("date", e.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => update("date", new Date().toLocaleDateString("en-CA"))}
                      className="shrink-0 rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                      title="Set to current date"
                    >
                      Today
                    </button>
                  </div>
                </Field>
                <Field label="Read time">
                  <input
                    required
                    value={post.readTime}
                    onChange={(e) => update("readTime", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 8 min read"
                  />
                </Field>
              </div>

              <ImageUploadField label="Hero image" value={post.image} onChange={(url) => update("image", url)} aspectRatio={21 / 9} />
              <Field label="Image alt text" hint="Describe the photo for screen readers and Google Images.">
                <input required value={post.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} className={inputClass} />
              </Field>
            </SectionCard>

            <SectionCard title="Summary" description="Shown on the blog listing card and at the top of the article.">
              <div>
                <label className={labelClass}>Excerpt</label>
                <p className={`${inputClass} min-h-[3.5rem] cursor-default bg-stone-50 text-stone-600`}>
                  <span className="line-clamp-3">{autoExcerpt || "Start writing the article below and this will fill in automatically."}</span>
                </p>
                <p className={hintClass}>
                  Auto-generated from the article content (3 lines, then "…") — shown on the blog listing card. Nothing to fill in here.
                </p>
              </div>
              <Field label="Quick Answer callout" hint='The highlighted "TL;DR" box right under the title.'>
                <textarea required rows={2} value={post.quickAnswer} onChange={(e) => update("quickAnswer", e.target.value)} className={inputClass} />
              </Field>
            </SectionCard>

            <SectionCard
              title="Article Content"
              description="Write the article top to bottom, just like a normal document. Use the toolbar to make text a heading, add bold/links/lists/tables, or drop in an image."
            >
              <TiptapArticleEditor
                value={post.content}
                onChange={(html) => update("content", html)}
                placeholder="Write the article here… use the toolbar for headings, bold, links, lists, tables, or images."
                allowedHeadings={[2, 3]}
                minHeight="26rem"
                stickyOffset="3rem"
              />
              <p className="text-xs text-stone-500">~{wordCount} words in the article body.</p>

              <div className="border-t border-stone-200 pt-5">
                <Field label="Recommended tour (cross-sell widget)">
                  <select value={post.recommendedTourId} onChange={(e) => update("recommendedTourId", e.target.value)} className={inputClass}>
                    <option value="">— None —</option>
                    {tours.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.museumName ? `${t.museumName} — ${t.title}` : t.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={!!post.recommendedTourAfterBlock}
                    onChange={(e) => update("recommendedTourAfterBlock", e.target.checked ? 1 : undefined)}
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  Show it under the article, before the "Ready to book?" box
                </label>
              </div>
            </SectionCard>

            <SectionCard title='"Ready to book?" callout' description="The closing box at the end of the article — falls back to the default copy below until you change it.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Heading">
                  <input value={post.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Button text">
                  <input value={post.ctaButtonText} onChange={(e) => update("ctaButtonText", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Body text">
                <textarea rows={2} value={post.ctaBody} onChange={(e) => update("ctaBody", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Button link" hint="A relative path (e.g. /#tours) or a full https:// URL.">
                <input value={post.ctaButtonHref} onChange={(e) => update("ctaButtonHref", e.target.value)} className={inputClass} />
              </Field>
              <div className="rounded-2xl border border-canal-blue/20 bg-canal-blue/5 p-6">
                <p className="text-sm font-semibold text-stone-900">{post.ctaHeading || "Ready to book?"}</p>
                <p className="mt-1 text-sm text-stone-900/70">{post.ctaBody}</p>
                <span className="mt-4 inline-flex rounded-full bg-canal-orange px-5 py-2.5 text-sm font-semibold text-white">
                  {post.ctaButtonText || "See Price Comparison"}
                </span>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ---------------- SEO & PREVIEW TAB ---------------- */}
        {activeTab === "seo" && (
          <div className="space-y-5">
            <SectionCard title="Search & Preview" description="How this post shows up on Google and in the blog listing.">
              <Field label="SEO title" hint="Shown as the blue link text in Google search results.">
                <input required value={post.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className={inputClass} />
                <CharCounter length={post.metaTitle.length} min={40} max={60} />
              </Field>
              <Field label="Meta description" hint="The gray snippet under the title in Google search results.">
                <textarea required rows={3} value={post.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className={inputClass} />
                <CharCounter length={post.metaDescription.length} min={120} max={158} />
              </Field>
              <SeoPreview title={post.metaTitle || post.title} description={post.metaDescription || autoExcerpt} path={`/${post.slug || "…"}`} />
            </SectionCard>

            <SectionCard title="Social Share Preview" description="What this looks like when the link is shared on Facebook, WhatsApp, or X.">
              <SocialPreview
                title={post.ogTitle || post.metaTitle || post.title}
                description={post.ogDescription || post.metaDescription || autoExcerpt}
                image={post.ogImage || post.image}
              />
            </SectionCard>

            <SeoFieldsCard
              pathHint={`/${post.slug || "…"}`}
              value={{
                canonicalUrl: post.canonicalUrl,
                noIndex: post.noIndex,
                noFollow: post.noFollow,
                ogTitle: post.ogTitle,
                ogDescription: post.ogDescription,
                ogImage: post.ogImage,
              }}
              onChange={(patch) => {
                setPost((p) => ({ ...p, ...patch }));
                setDirty(true);
                setSaved(false);
              }}
            />
          </div>
        )}

        {/* ---------------- ADVANCED SEO TAB ---------------- */}
        {activeTab === "advanced" && (
          <div className="space-y-5">
            <SectionCard title="Focus keyword" description="The main phrase you want this post to rank for. Purely a writing aid — nothing here is sent to Google.">
              <Field label="Focus keyword">
                <input
                  value={post.focusKeyword}
                  onChange={(e) => update("focusKeyword", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Visit Museums"
                />
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

            <SectionCard title="Schema, sitemap &amp; redirects" description="Technical SEO that's already wired up automatically for every post.">
              <ul className="space-y-2 text-sm text-stone-700">
                <li>✓ Article structured data (headline, image, publish/update dates, author) is added automatically.</li>
                <li>
                  ✓ <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">/sitemap.xml</code> includes this post automatically and updates its "last modified" date on every save.
                </li>
                <li>✓ Changing the URL slug (in the Content tab) automatically 301-redirects the old address here — no broken links.</li>
              </ul>
              {incomingRedirects.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Old addresses that redirect here</p>
                  <ul className="space-y-1 text-sm text-stone-700">
                    {incomingRedirects.map((r) => (
                      <li key={r.oldSlug} className="rounded-lg bg-stone-50 px-3 py-1.5 font-mono text-xs">
                        /{r.oldSlug} → /{post.slug}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-stone-500">
                Per-page indexing (Index/Follow) is controlled from the "SEO &amp; Preview" tab above.
              </p>
            </SectionCard>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl">
        <SaveBar
          saving={saving}
          disabled={!dirty}
          label={isNew ? "Publish Post" : "Save Changes"}
          onCancel={handleCancel}
          note={dirty ? "Unsaved changes" : "All changes saved"}
        />
      </div>
    </form>
  );
}
