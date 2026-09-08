// Inserts any blog post that exists in data/posts.json but is missing from
// the live database — same reasoning as scripts/sync-missing-museums.mjs.
//
// scripts/setup-db.mjs's seedPosts() only ever seeds once, the first time
// the posts table is empty (by design, so it can never resurrect a post an
// admin deleted). If data/posts.json is later hand-edited to add more
// posts, nothing re-runs the insert for the new ones, and getPost(slug)
// falling back to the seed file per-slug means those posts could still
// render — but getPosts() (the list used by /blog, /category/*, and the
// sitemap) only reads DB rows once the table is non-empty, so new
// seed-only posts wouldn't show up in the blog listing, in the admin's
// Posts list, or in the sitemap even though their own page works.
//
// Safe to run any time, as many times as you like:
//   node scripts/sync-missing-posts.mjs

import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to your .env file, then re-run.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const dataDir = path.join(process.cwd(), "data");

function readJsonFile(name) {
  const filePath = path.join(dataDir, name);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

async function main() {
  const posts = readJsonFile("posts.json") || [];
  const existing = await sql`SELECT slug FROM posts`;
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const missing = posts.filter((p) => !existingSlugs.has(p.slug));

  if (!missing.length) {
    console.log(`posts: all ${posts.length} already in the database — nothing to do.`);
    return;
  }

  let nextSortOrder = existing.length;
  for (const p of missing) {
    const date = p.date || new Date().toISOString().slice(0, 10);
    await sql`
      INSERT INTO posts (
        slug, title, meta_title, meta_description, category, excerpt,
        quick_answer, read_time, date, updated_at, image, image_alt, author,
        recommended_tour_id, recommended_tour_after_block, content, sort_order,
        cta_heading, cta_body, cta_button_text, cta_button_href, focus_keyword,
        no_index, no_follow, canonical_url, og_title, og_description, og_image
      ) VALUES (
        ${p.slug}, ${p.title}, ${p.metaTitle || p.title}, ${p.metaDescription || p.excerpt || ""},
        ${p.category || "Museum Guides"}, ${p.excerpt || ""}, ${p.quickAnswer || ""},
        ${p.readTime || "5 min read"}, ${date}, ${p.updatedAt || date}, ${p.image || ""}, ${p.imageAlt || ""},
        ${p.author || "Visit Museums Editorial Team"},
        ${p.recommendedTourId || ""}, ${p.recommendedTourAfterBlock ?? null},
        ${JSON.stringify(p.content || "")}::jsonb, ${nextSortOrder},
        ${p.ctaHeading || ""}, ${p.ctaBody || ""}, ${p.ctaButtonText || ""}, ${p.ctaButtonHref || ""},
        ${p.focusKeyword || "visit museums"}, ${!!p.noIndex}, ${!!p.noFollow}, ${p.canonicalUrl || ""},
        ${p.ogTitle || ""}, ${p.ogDescription || ""}, ${p.ogImage || ""}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    nextSortOrder++;
  }
  console.log(`posts: inserted ${missing.length} missing row(s): ${missing.map((p) => p.slug).join(", ")}`);
  console.log("\nDone. Refresh /admin/posts — every post should now show up there.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
