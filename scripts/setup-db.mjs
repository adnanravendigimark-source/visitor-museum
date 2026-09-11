// One-time (and safe-to-re-run) database setup for the Visit Museums admin CMS.
//
// What it does:
//   1. Creates every table the app needs, if they don't already exist
//      (schema migration only — this part is always safe to re-run).
//   2. ONLY when run with --seed, seeds empty tables from the matching file
//      in /data (the real Louvre / Duomo Florence / Uffizi / Lindt Home of
//      Chocolate launch content) so the site has real content from the
//      first run.
//
// Why seeding is gated behind --seed (do not remove this gate):
//   A plain `node scripts/setup-db.mjs` (e.g. run again after a schema
//   change, or by a deploy hook) must be pure migration. If seeding ran
//   automatically whenever a table happened to be empty, deleting every
//   museum/post/FAQ through the admin — a legitimate, intentional action —
//   would look identical to "table never seeded yet", and the next deploy
//   would silently repopulate the sample content, overwriting a real
//   deletion. Seeding now only runs when explicitly requested with --seed.
//
// How to run it:
//   1. Add DATABASE_URL to your .env file
//   2. First run (creates schema + seeds real launch content):
//        node scripts/setup-db.mjs --seed
//   3. Any later run (schema migrations only, never touches your data):
//        node scripts/setup-db.mjs

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

const SHOULD_SEED = process.argv.includes("--seed");

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

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

async function createTables() {
  console.log("Creating tables (if they don't already exist)...");

  await sql`
    CREATE TABLE IF NOT EXISTS museums (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      currency_symbol TEXT NOT NULL DEFAULT '€',
      lat DOUBLE PRECISION NOT NULL DEFAULT 0,
      lng DOUBLE PRECISION NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT false,
      card_image TEXT NOT NULL DEFAULT '',
      card_image_alt TEXT NOT NULL DEFAULT '',
      card_tagline TEXT NOT NULL DEFAULT '',
      hero_badge TEXT NOT NULL DEFAULT '',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subheading TEXT NOT NULL DEFAULT '',
      hero_image TEXT NOT NULL DEFAULT '',
      hero_image_alt TEXT NOT NULL DEFAULT '',
      hero_trust_badge TEXT NOT NULL DEFAULT 'Authorized Ticket Partner',
      highlights_eyebrow TEXT NOT NULL DEFAULT '',
      highlights_heading TEXT NOT NULL DEFAULT '',
      highlights_subheading TEXT NOT NULL DEFAULT '',
      highlights JSONB NOT NULL DEFAULT '[]',
      about_heading TEXT NOT NULL DEFAULT '',
      about_body TEXT NOT NULL DEFAULT '',
      tours_eyebrow TEXT NOT NULL DEFAULT '',
      tours_heading TEXT NOT NULL DEFAULT '',
      tours_subheading TEXT NOT NULL DEFAULT '',
      practical_hours_heading TEXT NOT NULL DEFAULT '',
      practical_hours JSONB NOT NULL DEFAULT '[]',
      practical_hours_note TEXT NOT NULL DEFAULT '',
      practical_address_heading TEXT NOT NULL DEFAULT '',
      practical_address TEXT NOT NULL DEFAULT '',
      practical_getting_there TEXT NOT NULL DEFAULT '',
      practical_best_time_heading TEXT NOT NULL DEFAULT '',
      practical_best_time_body TEXT NOT NULL DEFAULT '',
      price_eyebrow TEXT NOT NULL DEFAULT '',
      price_heading TEXT NOT NULL DEFAULT '',
      price_subheading TEXT NOT NULL DEFAULT '',
      price_note TEXT NOT NULL DEFAULT '',
      faq_eyebrow TEXT NOT NULL DEFAULT '',
      faq_heading TEXT NOT NULL DEFAULT '',
      cta_heading TEXT NOT NULL DEFAULT '',
      cta_subtext TEXT NOT NULL DEFAULT '',
      cta_button_text TEXT NOT NULL DEFAULT '',
      nearby_heading_override TEXT NOT NULL DEFAULT '',
      nearby_places_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      nearby_places_resolved_at TIMESTAMPTZ,
      rating NUMERIC(2, 1) NOT NULL DEFAULT 4.7,
      reviews_count TEXT NOT NULL DEFAULT '10.2k',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Idempotent migration for installs that already ran setup-db.mjs before
  // rating/reviews_count existed — CREATE TABLE IF NOT EXISTS above won't
  // retroactively add columns to an existing museums table, so this must
  // run every time regardless (a no-op once the columns are already there).
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) NOT NULL DEFAULT 4.7`;
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS reviews_count TEXT NOT NULL DEFAULT '10.2k'`;
  // SUPERSEDED — the entire "Nearby Attractions" feature (auto-resolved
  // from OpenStreetMap by coordinate) has been replaced by admin-authored
  // "Other Attractions", a city-scoped table of its own (see
  // other_attractions below / lib/otherAttractions.ts). Nothing in the app
  // reads or writes nearby_image_overrides, nearby_places_json, or
  // nearby_places_resolved_at any more — left as harmless no-op
  // ADD COLUMNs (matches this file's never-DROP migration policy) rather
  // than deleting the columns and whatever data an install already has in
  // them. nearby_heading_override (on the CREATE TABLE above) is dead for
  // the same reason.
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS nearby_image_overrides JSONB NOT NULL DEFAULT '{}'::jsonb`;
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS nearby_places_json JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS nearby_places_resolved_at TIMESTAMPTZ`;
  // Small trust label shown next to the rating in the museum page's hero
  // (see components/MuseumHero.tsx) — editable per museum instead of a
  // fixed string, same as every other piece of hero copy on this table.
  await sql`ALTER TABLE museums ADD COLUMN IF NOT EXISTS hero_trust_badge TEXT NOT NULL DEFAULT 'Authorized Ticket Partner'`;

  // lat/lng feed this page's GeoCoordinates structured data (see
  // app/[slug]/page.tsx). Indexing them isn't strictly required at this
  // table size, but costs nothing.
  await sql`CREATE INDEX IF NOT EXISTS museums_lat_lng_idx ON museums (lat, lng)`;

  await sql`
    CREATE TABLE IF NOT EXISTS museum_tours (
      id TEXT PRIMARY KEY,
      museum_id TEXT NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
      badge TEXT NOT NULL DEFAULT 'self-guided',
      ribbon TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      includes JSONB NOT NULL DEFAULT '[]',
      highlights JSONB NOT NULL DEFAULT '[]',
      excludes JSONB NOT NULL DEFAULT '[]',
      duration TEXT,
      rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
      reviews INTEGER NOT NULL DEFAULT 0,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      original_price NUMERIC(10, 2),
      image TEXT NOT NULL DEFAULT '',
      image_alt TEXT NOT NULL DEFAULT '',
      href_path TEXT NOT NULL DEFAULT '',
      href_extra TEXT,
      featured BOOLEAN NOT NULL DEFAULT false,
      best_for TEXT NOT NULL DEFAULT '',
      price_table_column1 TEXT NOT NULL DEFAULT '',
      price_table_feature TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS museum_tours_museum_id_idx ON museum_tours (museum_id)`;
  // Idempotent migration for installs that already ran setup-db.mjs before
  // city/country existed on tickets — CREATE TABLE IF NOT EXISTS above
  // won't retroactively add columns to an existing museum_tours table, so
  // this must run every time regardless (a no-op once the columns are
  // already there). Lets each ticket be classified/filtered by city and
  // country in the admin (see lib/museums.ts's TourRecord and
  // components/admin/MuseumTourForm.tsx's City field), independent of —
  // though normally matching — its own museum's city/country, since a
  // combo ticket can legitimately span more than one city.
  await sql`ALTER TABLE museum_tours ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE museum_tours ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT ''`;
  await sql`CREATE INDEX IF NOT EXISTS museum_tours_city_country_idx ON museum_tours (country, city)`;

  await sql`
    CREATE TABLE IF NOT EXISTS museum_faqs (
      id TEXT PRIMARY KEY,
      museum_id TEXT NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS museum_faqs_museum_id_idx ON museum_faqs (museum_id)`;

  // Other Attractions — admin-authored, managed per museum (exactly like
  // museum_tours above): each row belongs to exactly one museum, added and
  // edited from that museum's own "Manage Other Attractions" screen (see
  // lib/otherAttractions.ts and /admin/attractions/[museumId]). Replaces
  // the old auto-resolved "Nearby Attractions" feature (see the
  // now-superseded nearby_* columns on `museums` below).
  await sql`
    CREATE TABLE IF NOT EXISTS other_attractions (
      id TEXT PRIMARY KEY,
      museum_id TEXT NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
      badge TEXT,
      ribbon TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      includes JSONB NOT NULL DEFAULT '[]',
      duration TEXT,
      rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
      reviews INTEGER NOT NULL DEFAULT 0,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      original_price NUMERIC(10, 2),
      image TEXT NOT NULL DEFAULT '',
      image_alt TEXT NOT NULL DEFAULT '',
      href_path TEXT NOT NULL DEFAULT '',
      href_extra TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS other_attractions_museum_id_idx ON other_attractions (museum_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Museum Guides',
      excerpt TEXT NOT NULL DEFAULT '',
      quick_answer TEXT NOT NULL DEFAULT '',
      read_time TEXT NOT NULL DEFAULT '5 min read',
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      updated_at TIMESTAMPTZ,
      image TEXT NOT NULL DEFAULT '',
      image_alt TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '',
      recommended_tour_id TEXT NOT NULL DEFAULT '',
      recommended_tour_after_block INTEGER,
      content JSONB NOT NULL DEFAULT '""',
      cta_heading TEXT NOT NULL DEFAULT '',
      cta_body TEXT NOT NULL DEFAULT '',
      cta_button_text TEXT NOT NULL DEFAULT '',
      cta_button_href TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      canonical_url TEXT NOT NULL DEFAULT '',
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS post_redirects (
      old_slug TEXT PRIMARY KEY,
      new_slug TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS homepage (
      id INTEGER PRIMARY KEY DEFAULT 1,
      hero_badge TEXT NOT NULL DEFAULT '',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subheading TEXT NOT NULL DEFAULT '',
      hero_image TEXT NOT NULL DEFAULT '',
      hero_image_alt TEXT NOT NULL DEFAULT '',
      hero_gallery JSONB NOT NULL DEFAULT '[]',
      hero_features JSONB NOT NULL DEFAULT '[]',
      hero_cta_primary_text TEXT NOT NULL DEFAULT '',
      hero_cta_primary_href TEXT NOT NULL DEFAULT '',
      hero_cta_secondary_text TEXT NOT NULL DEFAULT '',
      hero_cta_secondary_href TEXT NOT NULL DEFAULT '',
      rating_value TEXT NOT NULL DEFAULT '',
      rating_count TEXT NOT NULL DEFAULT '',
      sections_json JSONB NOT NULL DEFAULT '{}',
      header_json JSONB NOT NULL DEFAULT '{}',
      footer_json JSONB NOT NULL DEFAULT '{}',
      theme_json JSONB NOT NULL DEFAULT '{}',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      CONSTRAINT homepage_singleton CHECK (id = 1)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS privacy_policy (
      id INTEGER PRIMARY KEY DEFAULT 1,
      title TEXT NOT NULL DEFAULT 'Privacy Policy',
      last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
      last_updated_label TEXT NOT NULL DEFAULT 'Last updated: ',
      empty_state_text TEXT NOT NULL DEFAULT E'This page hasn''t been filled in yet.',
      content JSONB NOT NULL DEFAULT '[]',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      CONSTRAINT privacy_policy_singleton CHECK (id = 1)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS about_page (
      id INTEGER PRIMARY KEY DEFAULT 1,
      hero_eyebrow TEXT NOT NULL DEFAULT 'About Us',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subheading TEXT NOT NULL DEFAULT '',
      hero_image TEXT NOT NULL DEFAULT '',
      hero_image_alt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      CONSTRAINT about_page_singleton CHECK (id = 1)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_page (
      id INTEGER PRIMARY KEY DEFAULT 1,
      hero_eyebrow TEXT NOT NULL DEFAULT '',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subheading TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      email_label TEXT NOT NULL DEFAULT 'Email Us Directly',
      email_note TEXT NOT NULL DEFAULT '',
      reasons_heading TEXT NOT NULL DEFAULT '',
      reasons JSONB NOT NULL DEFAULT '[]',
      footer_note TEXT NOT NULL DEFAULT '',
      cta_heading TEXT NOT NULL DEFAULT '',
      cta_button_label TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index BOOLEAN NOT NULL DEFAULT false,
      no_follow BOOLEAN NOT NULL DEFAULT false,
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      CONSTRAINT contact_page_singleton CHECK (id = 1)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      blog_no_index BOOLEAN NOT NULL DEFAULT false,
      blog_no_follow BOOLEAN NOT NULL DEFAULT false,
      blog_meta_title TEXT NOT NULL DEFAULT '',
      blog_meta_description TEXT NOT NULL DEFAULT '',
      blog_canonical_url TEXT NOT NULL DEFAULT '',
      blog_og_title TEXT NOT NULL DEFAULT '',
      blog_og_description TEXT NOT NULL DEFAULT '',
      blog_og_image TEXT NOT NULL DEFAULT '',
      blog_hero_eyebrow TEXT NOT NULL DEFAULT '',
      blog_hero_heading TEXT NOT NULL DEFAULT '',
      blog_hero_subheading TEXT NOT NULL DEFAULT '',
      blog_empty_state_text TEXT NOT NULL DEFAULT '',
      blog_cta_button_text TEXT NOT NULL DEFAULT '',
      blog_cta_button_href TEXT NOT NULL DEFAULT '',
      admin_password_hash TEXT,
      CONSTRAINT site_settings_singleton CHECK (id = 1)
    )
  `;

  // Idempotent migration for installs that already ran setup-db.mjs before
  // the Blog Page's hero/content fields existed — same reasoning as the
  // museums rating/reviews_count migration above.
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_hero_eyebrow TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_hero_heading TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_hero_subheading TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_empty_state_text TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_cta_button_text TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS blog_cta_button_href TEXT NOT NULL DEFAULT ''`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      pages JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS media_library (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      filename TEXT NOT NULL DEFAULT '',
      content_type TEXT NOT NULL DEFAULT '',
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  console.log("Tables ready.");
}

/* ------------------------------------------------------------------ */
/* Seeding (only with --seed)                                          */
/* ------------------------------------------------------------------ */

async function seedMuseums() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM museums`;
  if (count > 0) {
    console.log(`museums: already has ${count} row(s) — skipping seed.`);
    return;
  }
  const museums = readJsonFile("museums.json");
  if (!museums || museums.length === 0) {
    console.log("museums: no data/museums.json to seed from — skipping.");
    return;
  }
  for (let i = 0; i < museums.length; i++) {
    const m = museums[i];
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
        ${Number(m.lat) || 0}, ${Number(m.lng) || 0}, ${m.sortOrder ?? i}, ${!!m.featured},
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
  }
  console.log(`museums: seeded ${museums.length} row(s).`);
}

async function seedMuseumTours() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM museum_tours`;
  if (count > 0) {
    console.log(`museum_tours: already has ${count} row(s) — skipping seed.`);
    return;
  }
  const tours = readJsonFile("museum-tours.json");
  if (!tours || tours.length === 0) {
    console.log("museum_tours: no data/museum-tours.json to seed from — skipping.");
    return;
  }
  // sort_order restarts per museum, matching lib/museums.ts's insertTour
  // (COUNT(*) WHERE museum_id = ...), not one global counter.
  const perMuseumIndex = {};
  for (const t of tours) {
    const museumId = t.museumId;
    const i = perMuseumIndex[museumId] ?? 0;
    perMuseumIndex[museumId] = i + 1;
    await sql`
      INSERT INTO museum_tours (
        id, museum_id, badge, ribbon, title, description, includes, highlights, excludes,
        duration, rating, reviews, price, original_price, image, image_alt, href_path,
        href_extra, featured, best_for, price_table_column1, price_table_feature, category, sort_order
      ) VALUES (
        ${t.id}, ${museumId}, ${t.badge || "self-guided"}, ${t.ribbon || null}, ${t.title}, ${t.description || ""},
        ${JSON.stringify(t.includes || [])}::jsonb, ${JSON.stringify(t.highlights || [])}::jsonb, ${JSON.stringify(t.excludes || [])}::jsonb,
        ${t.duration || null}, ${t.rating ?? 5}, ${t.reviews ?? 0}, ${t.price ?? 0}, ${t.originalPrice ?? null},
        ${t.image || ""}, ${t.imageAlt || ""}, ${t.hrefPath || t.href || ""}, ${t.hrefExtra || null},
        ${!!t.featured}, ${t.bestFor || ""}, ${t.priceTableColumn1 || ""}, ${t.priceTableFeature || ""},
        ${t.category || ""}, ${i}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`museum_tours: seeded ${tours.length} row(s).`);
}

async function seedMuseumFaqs() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM museum_faqs`;
  if (count > 0) {
    console.log(`museum_faqs: already has ${count} row(s) — skipping seed.`);
    return;
  }
  const faqs = readJsonFile("museum-faqs.json");
  if (!faqs || faqs.length === 0) {
    console.log("museum_faqs: no data/museum-faqs.json to seed from — skipping.");
    return;
  }
  const perMuseumIndex = {};
  for (const f of faqs) {
    const museumId = f.museumId;
    const i = perMuseumIndex[museumId] ?? 0;
    perMuseumIndex[museumId] = i + 1;
    const id = f.id || `${museumId}-faq-${i + 1}`;
    await sql`
      INSERT INTO museum_faqs (id, museum_id, question, answer, category, sort_order)
      VALUES (${id}, ${museumId}, ${f.question}, ${f.answer}, ${f.category || ""}, ${i})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`museum_faqs: seeded ${faqs.length} row(s).`);
}

async function seedPosts() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM posts`;
  if (count > 0) {
    console.log(`posts: already has ${count} row(s) — skipping seed.`);
    return;
  }
  const posts = readJsonFile("posts.json");
  if (!posts || posts.length === 0) {
    console.log("posts: no data/posts.json to seed from — skipping.");
    return;
  }
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
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
        ${JSON.stringify(p.content || "")}::jsonb, ${i},
        ${p.ctaHeading || ""}, ${p.ctaBody || ""}, ${p.ctaButtonText || ""}, ${p.ctaButtonHref || ""},
        ${p.focusKeyword || "visit museums"}, ${!!p.noIndex}, ${!!p.noFollow}, ${p.canonicalUrl || ""},
        ${p.ogTitle || ""}, ${p.ogDescription || ""}, ${p.ogImage || ""}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`posts: seeded ${posts.length} row(s).`);
}

async function seedHomepage() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM homepage`;
  if (count > 0) {
    console.log("homepage: already configured — skipping seed.");
    return;
  }
  await sql`INSERT INTO homepage (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  console.log("homepage: inserted defaults (lib/homepage.ts's DEFAULT_* constants apply until edited in the admin).");
}

async function seedPrivacyPolicy() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM privacy_policy`;
  if (count > 0) {
    console.log("privacy_policy: already configured — skipping seed.");
    return;
  }
  const p = readJsonFile("privacy-policy.json");
  const today = new Date().toISOString().slice(0, 10);
  if (!p) {
    await sql`INSERT INTO privacy_policy (id, last_updated) VALUES (1, ${today}) ON CONFLICT (id) DO NOTHING`;
    console.log("privacy_policy: no data/privacy-policy.json — inserted defaults.");
    return;
  }
  const contentBlocks = (p.sections || []).map((s) => ({
    type: "paragraph",
    text: `<h3>${s.heading}</h3><p>${s.content}</p>`,
  }));
  await sql`
    INSERT INTO privacy_policy (id, title, last_updated, content)
    VALUES (1, ${p.title || "Privacy Policy"}, ${today}, ${JSON.stringify(contentBlocks)}::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("privacy_policy: seeded from data/privacy-policy.json.");
}

async function seedSiteSettings() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM site_settings`;
  if (count > 0) {
    console.log("site_settings: already configured — skipping seed.");
    return;
  }
  await sql`INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  console.log("site_settings: inserted defaults (lib/settings.ts's DEFAULT_SETTINGS apply until edited).");
}

async function seedAboutPage() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM about_page`;
  if (count > 0) {
    console.log("about_page: already configured — skipping seed.");
    return;
  }
  await sql`INSERT INTO about_page (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  console.log("about_page: inserted defaults (lib/about.ts's DEFAULT_ABOUT applies until edited).");
}

async function seedContactPage() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM contact_page`;
  if (count > 0) {
    console.log("contact_page: already configured — skipping seed.");
    return;
  }
  await sql`INSERT INTO contact_page (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  console.log("contact_page: inserted defaults (lib/contact.ts's DEFAULT_CONTACT applies until edited).");
}

async function main() {
  await createTables();

  if (SHOULD_SEED) {
    console.log("\n--seed flag detected — seeding empty tables with real launch content...");
    await seedMuseums();
    await seedMuseumTours();
    await seedMuseumFaqs();
    await seedPosts();
    await seedHomepage();
    await seedPrivacyPolicy();
    await seedSiteSettings();
    await seedAboutPage();
    await seedContactPage();
  } else {
    console.log(
      "\nSkipping sample-content seeding (schema/migration only). Run with --seed to also seed the real launch content (Louvre, Duomo Florence, Uffizi Gallery, Lindt Home of Chocolate) into empty tables."
    );
  }

  console.log("\nDone. Visit Museums database is ready.");
  console.log(
    "Reminder: your first admin login is ADMIN_EMAIL / ADMIN_PASSWORD from your .env file — no database row needed for that owner account. See README.md."
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nSetup failed:", err);
    process.exit(1);
  });
