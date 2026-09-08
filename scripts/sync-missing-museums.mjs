// Inserts any museum (and its tours/FAQs) that exists in data/museums.json
// but is missing from the live database.
//
// Why this exists / what actually happened:
//   scripts/setup-db.mjs's seedMuseums() (and seedMuseumTours/seedMuseumFaqs)
//   only ever seed once — the very first time each table is empty. After
//   that, running `node scripts/setup-db.mjs --seed` again just prints
//   "already has N row(s) — skipping seed" and does nothing, by design
//   (so it can never silently undo an admin's deletions).
//
//   That's correct for protecting real edits, but it also means: if
//   data/museums.json is later edited by hand to add MORE museums (which
//   is exactly what happened here — it now has 16 entries, not the original
//   6), those new entries never get inserted into the database by any
//   normal flow. Yet lib/museums.ts's getMuseumBySlug() falls back to
//   data/museums.json PER SLUG when a slug isn't found in the DB — so
//   those extra museums' pages still render live on the public site.
//   getMuseums() (the list used by both the homepage grid and the admin's
//   Museums & Attractions page) does NOT do that per-item fallback — once
//   the DB has any rows at all, it returns only DB rows. So those extra
//   museums were fully live and linkable, but invisible and un-editable
//   in the admin.
//
// What this script does: for every museum/tour/FAQ in data/museums.json,
// data/museum-tours.json, and data/museum-faqs.json that ISN'T already a
// row in the database (matched by id), insert it. Existing rows — and any
// edits already made to them through the admin — are left completely
// untouched (ON CONFLICT (id) DO NOTHING everywhere, same as the real
// seed functions).
//
// Safe to run any time, as many times as you like:
//   node scripts/sync-missing-museums.mjs

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

async function syncMuseums() {
  const museums = readJsonFile("museums.json") || [];
  const existing = await sql`SELECT id FROM museums`;
  const existingIds = new Set(existing.map((r) => r.id));
  const missing = museums.filter((m) => !existingIds.has(m.id));

  if (!missing.length) {
    console.log(`museums: all ${museums.length} already in the database — nothing to do.`);
    return;
  }

  let nextSortOrder = existing.length;
  for (const m of missing) {
    await sql`
      INSERT INTO museums (
        id, slug, name, city, country, currency_symbol, lat, lng, sort_order, featured,
        card_image, card_image_alt, card_tagline,
        hero_badge, hero_heading, hero_subheading, hero_image, hero_image_alt,
        highlights_eyebrow, highlights_heading, highlights_subheading, highlights,
        about_heading, about_body, tours_eyebrow, tours_heading, tours_subheading,
        practical_hours_heading, practical_hours, practical_hours_note,
        practical_address_heading, practical_address, practical_getting_there,
        practical_best_time_heading, practical_best_time_body,
        price_eyebrow, price_heading, price_subheading, price_note,
        faq_eyebrow, faq_heading,
        cta_heading, cta_subtext, cta_button_text, nearby_heading_override,
        rating, reviews_count,
        meta_title, meta_description, focus_keyword, canonical_url,
        no_index, no_follow, og_title, og_description, og_image
      ) VALUES (
        ${m.id}, ${m.slug}, ${m.name}, ${m.city || ""}, ${m.country || ""}, ${m.currencySymbol || "€"},
        ${Number(m.lat) || 0}, ${Number(m.lng) || 0}, ${m.sortOrder ?? nextSortOrder}, ${!!m.featured},
        ${m.cardImage || ""}, ${m.cardImageAlt || ""}, ${m.cardTagline || ""},
        ${m.heroBadge || ""}, ${m.heroHeading || m.name}, ${m.heroSubheading || ""}, ${m.heroImage || ""}, ${m.heroImageAlt || ""},
        ${m.highlightsEyebrow || ""}, ${m.highlightsHeading || ""}, ${m.highlightsSubheading || ""}, ${JSON.stringify(m.highlights || [])}::jsonb,
        ${m.aboutHeading || ""}, ${m.aboutBody || ""}, ${m.toursEyebrow || ""}, ${m.toursHeading || ""}, ${m.toursSubheading || ""},
        ${m.practicalHoursHeading || ""}, ${JSON.stringify(m.practicalHours || [])}::jsonb, ${m.practicalHoursNote || ""},
        ${m.practicalAddressHeading || ""}, ${m.practicalAddress || ""}, ${m.practicalGettingThere || ""},
        ${m.practicalBestTimeHeading || ""}, ${m.practicalBestTimeBody || ""},
        ${m.priceEyebrow || ""}, ${m.priceHeading || ""}, ${m.priceSubheading || ""}, ${m.priceNote || ""},
        ${m.faqEyebrow || ""}, ${m.faqHeading || ""},
        ${m.ctaHeading || ""}, ${m.ctaSubtext || ""}, ${m.ctaButtonText || ""}, ${m.nearbyHeadingOverride || ""},
        ${m.rating ?? 4.7}, ${m.reviewsCount || "10.2k"},
        ${m.metaTitle || m.name}, ${m.metaDescription || ""}, ${m.focusKeyword || "visit museums"}, ${m.canonicalUrl || ""},
        ${!!m.noIndex}, ${!!m.noFollow}, ${m.ogTitle || ""}, ${m.ogDescription || ""}, ${m.ogImage || ""}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    nextSortOrder++;
  }
  console.log(`museums: inserted ${missing.length} missing row(s): ${missing.map((m) => m.name).join(", ")}`);
}

async function syncMuseumTours() {
  const tours = readJsonFile("museum-tours.json") || [];
  const existing = await sql`SELECT id, museum_id FROM museum_tours`;
  const existingIds = new Set(existing.map((r) => r.id));
  const perMuseumCount = {};
  for (const r of existing) perMuseumCount[r.museum_id] = (perMuseumCount[r.museum_id] || 0) + 1;

  const missing = tours.filter((t) => !existingIds.has(t.id));
  if (!missing.length) {
    console.log(`museum_tours: all ${tours.length} already in the database — nothing to do.`);
    return;
  }

  for (const t of missing) {
    const i = perMuseumCount[t.museumId] ?? 0;
    perMuseumCount[t.museumId] = i + 1;
    await sql`
      INSERT INTO museum_tours (
        id, museum_id, badge, ribbon, title, description, includes, highlights, excludes,
        duration, rating, reviews, price, original_price, image, image_alt, href_path,
        href_extra, featured, best_for, price_table_column1, price_table_feature, category, sort_order
      ) VALUES (
        ${t.id}, ${t.museumId}, ${t.badge || "self-guided"}, ${t.ribbon || null}, ${t.title}, ${t.description || ""},
        ${JSON.stringify(t.includes || [])}::jsonb, ${JSON.stringify(t.highlights || [])}::jsonb, ${JSON.stringify(t.excludes || [])}::jsonb,
        ${t.duration || null}, ${t.rating ?? 5}, ${t.reviews ?? 0}, ${t.price ?? 0}, ${t.originalPrice ?? null},
        ${t.image || ""}, ${t.imageAlt || ""}, ${t.hrefPath || t.href || ""}, ${t.hrefExtra || null},
        ${!!t.featured}, ${t.bestFor || ""}, ${t.priceTableColumn1 || ""}, ${t.priceTableFeature || ""},
        ${t.category || ""}, ${i}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`museum_tours: inserted ${missing.length} missing row(s).`);
}

async function syncMuseumFaqs() {
  const faqs = readJsonFile("museum-faqs.json") || [];
  const existing = await sql`SELECT id, museum_id FROM museum_faqs`;
  const existingIds = new Set(existing.map((r) => r.id));
  const perMuseumCount = {};
  for (const r of existing) perMuseumCount[r.museum_id] = (perMuseumCount[r.museum_id] || 0) + 1;

  let inserted = 0;
  for (const f of faqs) {
    const i = perMuseumCount[f.museumId] ?? 0;
    const id = f.id || `${f.museumId}-faq-${i + 1}`;
    if (existingIds.has(id)) continue;
    perMuseumCount[f.museumId] = i + 1;
    await sql`
      INSERT INTO museum_faqs (id, museum_id, question, answer, category, sort_order)
      VALUES (${id}, ${f.museumId}, ${f.question}, ${f.answer}, ${f.category || ""}, ${i})
      ON CONFLICT (id) DO NOTHING
    `;
    inserted++;
  }
  console.log(`museum_faqs: inserted ${inserted} missing row(s).`);
}

async function main() {
  await syncMuseums();
  await syncMuseumTours();
  await syncMuseumFaqs();
  console.log("\nDone. Refresh /admin/museums — every museum should now show up there.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
