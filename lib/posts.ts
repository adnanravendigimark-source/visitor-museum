import { sql } from "./db";
import postsSeed from "@/data/posts.json";

export type ContentBlockType = "paragraph" | "heading" | "list" | "image";

export interface ContentBlock {
  type: ContentBlockType;
  text?: string;
  level?: 2 | 3;
  items?: string[];
  ordered?: boolean;
  src?: string;
  alt?: string;
  caption?: string;
}

export interface Post {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  excerpt: string;
  quickAnswer: string;
  readTime: string;
  date: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  author: string;
  recommendedTourId: string;
  recommendedTourAfterBlock?: number;
  content: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButtonText: string;
  ctaButtonHref: string;
  focusKeyword: string;
  noIndex: boolean;
  noFollow: boolean;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const DEFAULT_CTA_HEADING = "Ready to plan your museum visit?";
const DEFAULT_CTA_BODY = "Compare skip-the-line tickets, guided tours, and combo passes for top museums and attractions.";
const DEFAULT_CTA_BUTTON_TEXT = "Browse Museum Tickets";
const DEFAULT_CTA_BUTTON_HREF = "/";
const DEFAULT_AUTHOR = "Visit Museums Editorial Team";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        const level = block.level === 3 ? 3 : 2;
        return `<h${level}>${escapeHtml(block.text || "")}</h${level}>`;
      }
      if (block.type === "list") {
        const tag = block.ordered ? "ol" : "ul";
        const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `<${tag}>${items}</${tag}>`;
      }
      if (block.type === "image") {
        if (!block.src) return "";
        const img = `<img src="${block.src}" alt="${escapeHtml(block.alt || "")}" />`;
        return block.caption
          ? `<figure>${img}<figcaption>${escapeHtml(block.caption)}</figcaption></figure>`
          : `<figure>${img}</figure>`;
      }
      return block.text || "";
    })
    .filter(Boolean)
    .join("");
}

function parseContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return blocksToHtml(value as ContentBlock[]);
  return "";
}

function toDateString(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value) return value.slice(0, 10);
  return fallback;
}

function seedToPost(seed: any): Post {
  return {
    slug: seed.slug,
    title: seed.title,
    metaTitle: seed.metaTitle,
    metaDescription: seed.metaDescription,
    category: seed.category,
    excerpt: seed.excerpt,
    quickAnswer: seed.quickAnswer || "",
    readTime: seed.readTime,
    date: seed.date,
    updatedAt: seed.updatedAt || seed.date,
    image: seed.image,
    imageAlt: seed.imageAlt,
    author: seed.author,
    recommendedTourId: seed.recommendedTourId,
    content: parseContent(seed.content),
    ctaHeading: DEFAULT_CTA_HEADING,
    ctaBody: DEFAULT_CTA_BODY,
    ctaButtonText: DEFAULT_CTA_BUTTON_TEXT,
    ctaButtonHref: DEFAULT_CTA_BUTTON_HREF,
    focusKeyword: seed.focusKeyword || "visit museums",
    noIndex: !!seed.noIndex,
    noFollow: !!seed.noFollow,
    canonicalUrl: seed.canonicalUrl || "",
    ogTitle: seed.ogTitle || seed.metaTitle,
    ogDescription: seed.ogDescription || seed.metaDescription,
    ogImage: seed.ogImage || seed.image,
  };
}

function rowToPost(row: any): Post {
  const dateStr = toDateString(row.date, row.created_at ? toDateString(row.created_at, "2026-03-20") : "2026-03-20");
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    category: row.category || "Museum Guides",
    excerpt: row.excerpt,
    quickAnswer: row.quick_answer || "",
    readTime: row.read_time || "5 min read",
    date: dateStr,
    updatedAt: row.updated_at ? toDateString(row.updated_at, dateStr) : dateStr,
    image: row.image || row.cover_image || "",
    imageAlt: row.image_alt || row.cover_image_alt || "",
    author: row.author || DEFAULT_AUTHOR,
    recommendedTourId: row.recommended_tour_id || "",
    recommendedTourAfterBlock:
      row.recommended_tour_after_block === null ? undefined : Number(row.recommended_tour_after_block),
    content: parseContent(row.content),
    ctaHeading: row.cta_heading || DEFAULT_CTA_HEADING,
    ctaBody: row.cta_body || DEFAULT_CTA_BODY,
    ctaButtonText: row.cta_button_text || DEFAULT_CTA_BUTTON_TEXT,
    ctaButtonHref: row.cta_button_href || DEFAULT_CTA_BUTTON_HREF,
    focusKeyword: row.focus_keyword || "visit museums",
    noIndex: !!row.no_index,
    noFollow: !!row.no_follow,
    canonicalUrl: row.canonical_url || "",
    ogTitle: row.og_title || row.meta_title || "",
    ogDescription: row.og_description || row.meta_description || "",
    ogImage: row.og_image || row.image || "",
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const rows = await sql`SELECT * FROM posts ORDER BY date DESC, slug ASC`;
    return rows.map(rowToPost);
  } catch {
    // DB unreachable (e.g. first run before setup-db.mjs has ever connected) -
    // fall back to seed content. An empty table is a valid, intentional state
    // (admin deleted every post) and must NOT fall back here.
    return (postsSeed as any[]).map(seedToPost);
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  // Matches lib/museums.ts's getMuseumBySlug(): falls through to the seed
  // file per-slug whenever the DB doesn't have this post, not just when the
  // DB is unreachable — otherwise a post that exists in data/posts.json but
  // hasn't been synced into the database yet would 404 on the live site
  // even though getPosts() (the list) can still see it via its own
  // whole-table fallback.
  try {
    const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (rows.length) return rowToPost(rows[0]);
  } catch {
    // fall through to seed
  }
  const seed = (postsSeed as any[]).find((p) => p.slug === slug);
  return seed ? seedToPost(seed) : null;
}

export async function savePost(post: Post): Promise<void> {
  // `content` is a JSONB column (holds either the old ContentBlock[] shape
  // or, since the TiptapArticleEditor migration, a plain HTML string) — it
  // must be written as JSON.stringify(...)::jsonb like every other jsonb
  // column in this file, or Postgres tries to parse the raw HTML itself as
  // JSON and rejects it outright (a real HTML string is never valid JSON).
  const contentValue = JSON.stringify(post.content || "");
  await sql`
    INSERT INTO posts (
      slug, title, meta_title, meta_description, category, excerpt,
      quick_answer, read_time, date, updated_at, image, image_alt, author,
      recommended_tour_id, recommended_tour_after_block, content,
      cta_heading, cta_body, cta_button_text, cta_button_href,
      focus_keyword, no_index, no_follow, canonical_url,
      og_title, og_description, og_image
    ) VALUES (
      ${post.slug}, ${post.title}, ${post.metaTitle}, ${post.metaDescription},
      ${post.category}, ${post.excerpt}, ${post.quickAnswer || ""}, ${post.readTime},
      ${post.date}, ${post.updatedAt || post.date}, ${post.image}, ${post.imageAlt},
      ${post.author}, ${post.recommendedTourId},
      ${post.recommendedTourAfterBlock ?? null},
      ${contentValue}::jsonb, ${post.ctaHeading}, ${post.ctaBody},
      ${post.ctaButtonText}, ${post.ctaButtonHref},
      ${post.focusKeyword || ""}, ${!!post.noIndex}, ${!!post.noFollow},
      ${post.canonicalUrl || ""}, ${post.ogTitle || ""}, ${post.ogDescription || ""},
      ${post.ogImage || ""}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      category = EXCLUDED.category,
      excerpt = EXCLUDED.excerpt,
      quick_answer = EXCLUDED.quick_answer,
      read_time = EXCLUDED.read_time,
      date = EXCLUDED.date,
      updated_at = EXCLUDED.updated_at,
      image = EXCLUDED.image,
      image_alt = EXCLUDED.image_alt,
      author = EXCLUDED.author,
      recommended_tour_id = EXCLUDED.recommended_tour_id,
      recommended_tour_after_block = EXCLUDED.recommended_tour_after_block,
      content = EXCLUDED.content,
      cta_heading = EXCLUDED.cta_heading,
      cta_body = EXCLUDED.cta_body,
      cta_button_text = EXCLUDED.cta_button_text,
      cta_button_href = EXCLUDED.cta_button_href,
      focus_keyword = EXCLUDED.focus_keyword,
      no_index = EXCLUDED.no_index,
      no_follow = EXCLUDED.no_follow,
      canonical_url = EXCLUDED.canonical_url,
      og_title = EXCLUDED.og_title,
      og_description = EXCLUDED.og_description,
      og_image = EXCLUDED.og_image
  `;
}

export async function deletePost(slug: string): Promise<void> {
  await sql`DELETE FROM posts WHERE slug = ${slug}`;
}

// Turns a free-text category (e.g. "Ticket Tips", "Skip-the-Line") into the
// URL-safe slug used at /category/[category] — the admin's Category field
// on each post is the single source of truth for both the category badge
// shown on the post and which /category page it belongs to, so this must
// stay in sync with however category links are built anywhere on the site.
export function categorySlug(category: string): string {
  return (category || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CategorySummary {
  name: string;
  slug: string;
  count: number;
}

// Real distinct categories, derived from whatever posts actually exist —
// never a fixed/hardcoded list — so the "Categories" sidebar widget always
// reflects what admins have actually typed into each post's Category field.
export function getCategoriesFromPosts(posts: Post[]): CategorySummary[] {
  const bySlug = new Map<string, CategorySummary>();
  for (const p of posts) {
    const name = p.category || "Museum Guides";
    const slug = categorySlug(name);
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (existing) existing.count += 1;
    else bySlug.set(slug, { name, slug, count: 1 });
  }
  return Array.from(bySlug.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getRelatedPosts(slug: string, count?: number): Promise<Post[]> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  return typeof count === "number" ? filtered.slice(0, count) : filtered;
}

export async function setPostIndexing(slug: string, noIndex: boolean, noFollow: boolean): Promise<void> {
  await sql`
    UPDATE posts
    SET no_index = ${!!noIndex}, no_follow = ${!!noFollow}
    WHERE slug = ${slug}
  `;
}

export async function savePosts(posts: Post[]): Promise<void> {
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    await sql`
      INSERT INTO posts (
        slug, title, meta_title, meta_description, category, excerpt,
        quick_answer, read_time, date, updated_at, image, image_alt, author,
        recommended_tour_id, recommended_tour_after_block, content, sort_order,
        cta_heading, cta_body, cta_button_text, cta_button_href, focus_keyword,
        no_index, no_follow, canonical_url, og_title, og_description, og_image
      ) VALUES (
        ${p.slug}, ${p.title}, ${p.metaTitle}, ${p.metaDescription}, ${p.category},
        ${p.excerpt}, ${p.quickAnswer}, ${p.readTime}, ${p.date}, ${p.updatedAt || p.date}, ${p.image}, ${p.imageAlt}, ${p.author || ""},
        ${p.recommendedTourId || ""}, ${p.recommendedTourAfterBlock ?? null},
        ${JSON.stringify(p.content || "")}::jsonb, ${i},
        ${p.ctaHeading || ""}, ${p.ctaBody || ""}, ${p.ctaButtonText || ""}, ${p.ctaButtonHref || ""}, ${p.focusKeyword || ""},
        ${!!p.noIndex}, ${!!p.noFollow}, ${p.canonicalUrl || ""}, ${p.ogTitle || ""}, ${p.ogDescription || ""}, ${p.ogImage || ""}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        category = EXCLUDED.category,
        excerpt = EXCLUDED.excerpt,
        quick_answer = EXCLUDED.quick_answer,
        read_time = EXCLUDED.read_time,
        date = EXCLUDED.date,
        updated_at = EXCLUDED.updated_at,
        image = EXCLUDED.image,
        image_alt = EXCLUDED.image_alt,
        author = EXCLUDED.author,
        recommended_tour_id = EXCLUDED.recommended_tour_id,
        recommended_tour_after_block = EXCLUDED.recommended_tour_after_block,
        content = EXCLUDED.content,
        sort_order = EXCLUDED.sort_order,
        cta_heading = EXCLUDED.cta_heading,
        cta_body = EXCLUDED.cta_body,
        cta_button_text = EXCLUDED.cta_button_text,
        cta_button_href = EXCLUDED.cta_button_href,
        focus_keyword = EXCLUDED.focus_keyword,
        no_index = EXCLUDED.no_index,
        no_follow = EXCLUDED.no_follow,
        canonical_url = EXCLUDED.canonical_url,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        og_image = EXCLUDED.og_image
    `;
  }
}
