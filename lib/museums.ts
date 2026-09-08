import { sql } from "./db";
import museumsSeed from "@/data/museums.json";
import museumToursSeed from "@/data/museum-tours.json";
import museumFaqsSeed from "@/data/museum-faqs.json";

export const PARTNER_ID = process.env.GYG_PARTNER_ID || "VISITMUSEUMS";

export function gygLink(path: string, extra = "") {
  const trimmed = (path || "").trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return `${trimmed}${extra || ""}`;
  }
  return `https://www.getyourguide.com/${trimmed}?partner_id=${PARTNER_ID}&utm_medium=online_publisher&cmp=visit-museums${extra}`;
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (Array.isArray(value)) return value as unknown as T;
  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Museum entity                                                       */
/* ------------------------------------------------------------------ */

export interface HighlightCard {
  icon: string;
  title: string;
  body: string;
}

export interface HoursRow {
  range: string;
  time: string;
}

export interface Museum {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  currencySymbol: string;
  lat: number;
  lng: number;
  sortOrder: number;
  featured: boolean;
  cardImage: string;
  cardImageAlt: string;
  cardTagline: string;
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageAlt: string;
  highlightsEyebrow: string;
  highlightsHeading: string;
  highlightsSubheading: string;
  highlights: HighlightCard[];
  aboutHeading: string;
  aboutBody: string;
  toursEyebrow: string;
  toursHeading: string;
  toursSubheading: string;
  practicalHoursHeading: string;
  practicalHours: HoursRow[];
  practicalHoursNote: string;
  practicalAddressHeading: string;
  practicalAddress: string;
  practicalGettingThere: string;
  practicalBestTimeHeading: string;
  practicalBestTimeBody: string;
  priceEyebrow: string;
  priceHeading: string;
  priceSubheading: string;
  priceNote: string;
  faqEyebrow: string;
  faqHeading: string;
  ctaHeading: string;
  ctaSubtext: string;
  ctaButtonText: string;
  nearbyHeadingOverride: string;
  rating?: number;
  reviewsCount?: string;

  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;

  createdAt: string;
  updatedAt: string;
}

function seedToMuseum(seed: any): Museum {
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    city: seed.city,
    country: seed.country,
    currencySymbol: seed.currencySymbol || "€",
    lat: Number(seed.lat),
    lng: Number(seed.lng),
    sortOrder: Number(seed.sortOrder ?? 0),
    featured: !!seed.featured,
    cardImage: seed.cardImage || "",
    cardImageAlt: seed.cardImageAlt || "",
    cardTagline: seed.cardTagline || "",
    heroBadge: seed.heroBadge || "",
    heroHeading: seed.heroHeading || seed.name,
    heroSubheading: seed.heroSubheading || "",
    heroImage: seed.heroImage || "",
    heroImageAlt: seed.heroImageAlt || "",
    highlightsEyebrow: seed.highlightsEyebrow || "What You'll See",
    highlightsHeading: seed.highlightsHeading || "",
    highlightsSubheading: seed.highlightsSubheading || "",
    highlights: Array.isArray(seed.highlights) ? seed.highlights : [],
    aboutHeading: seed.aboutHeading || "",
    aboutBody: seed.aboutBody || "",
    toursEyebrow: seed.toursEyebrow || "Compare & Book Tickets",
    toursHeading: seed.toursHeading || `Choose Your ${seed.name} Experience`,
    toursSubheading: seed.toursSubheading || "",
    practicalHoursHeading: seed.practicalHoursHeading || "Opening Hours",
    practicalHours: Array.isArray(seed.practicalHours) ? seed.practicalHours : [],
    practicalHoursNote: seed.practicalHoursNote || "",
    practicalAddressHeading: seed.practicalAddressHeading || "Address",
    practicalAddress: seed.practicalAddress || "",
    practicalGettingThere: seed.practicalGettingThere || "",
    practicalBestTimeHeading: seed.practicalBestTimeHeading || "Best Time to Visit",
    practicalBestTimeBody: seed.practicalBestTimeBody || "",
    priceEyebrow: seed.priceEyebrow || "Tickets & Tours",
    priceHeading: seed.priceHeading || `Compare ${seed.name} Tickets`,
    priceSubheading: seed.priceSubheading || "",
    priceNote: seed.priceNote || "",
    faqEyebrow: seed.faqEyebrow || "FAQs",
    faqHeading: seed.faqHeading || `${seed.name} — Frequently Asked Questions`,
    ctaHeading: seed.ctaHeading || `Ready to visit ${seed.name}?`,
    ctaSubtext: seed.ctaSubtext || "",
    ctaButtonText: seed.ctaButtonText || "Compare Tickets & Tours",
    nearbyHeadingOverride: seed.nearbyHeadingOverride || "",
    rating: seed.rating !== undefined ? Number(seed.rating) : 4.7,
    reviewsCount: seed.reviewsCount || "10.2k",
    metaTitle: seed.metaTitle || seed.name,
    metaDescription: seed.metaDescription || "",
    focusKeyword: seed.focusKeyword || "visit museums",
    canonicalUrl: seed.canonicalUrl || "",
    noIndex: !!seed.noIndex,
    noFollow: !!seed.noFollow,
    ogTitle: seed.ogTitle || seed.metaTitle || seed.name,
    ogDescription: seed.ogDescription || seed.metaDescription || "",
    ogImage: seed.ogImage || seed.heroImage || "",
    createdAt: seed.createdAt || new Date().toISOString(),
    updatedAt: seed.updatedAt || seed.createdAt || new Date().toISOString(),
  };
}

function rowToMuseum(row: any): Museum {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    country: row.country,
    currencySymbol: row.currency_symbol || "€",
    lat: Number(row.lat),
    lng: Number(row.lng),
    sortOrder: Number(row.sort_order ?? 0),
    featured: !!row.featured,
    cardImage: row.card_image || "",
    cardImageAlt: row.card_image_alt || "",
    cardTagline: row.card_tagline || "",
    heroBadge: row.hero_badge || "",
    heroHeading: row.hero_heading || row.name,
    heroSubheading: row.hero_subheading || "",
    heroImage: row.hero_image || "",
    heroImageAlt: row.hero_image_alt || "",
    highlightsEyebrow: row.highlights_eyebrow || "What You'll See",
    highlightsHeading: row.highlights_heading || "",
    highlightsSubheading: row.highlights_subheading || "",
    highlights: parseJsonObject<HighlightCard[]>(row.highlights, []),
    aboutHeading: row.about_heading || "",
    aboutBody: row.about_body || "",
    toursEyebrow: row.tours_eyebrow || "Compare & Book Tickets",
    toursHeading: row.tours_heading || `Choose Your ${row.name} Experience`,
    toursSubheading: row.tours_subheading || "",
    practicalHoursHeading: row.practical_hours_heading || "Opening Hours",
    practicalHours: parseJsonObject<HoursRow[]>(row.practical_hours, []),
    practicalHoursNote: row.practical_hours_note || "",
    practicalAddressHeading: row.practical_address_heading || "Address",
    practicalAddress: row.practical_address || "",
    practicalGettingThere: row.practical_getting_there || "",
    practicalBestTimeHeading: row.practical_best_time_heading || "Best Time to Visit",
    practicalBestTimeBody: row.practical_best_time_body || "",
    priceEyebrow: row.price_eyebrow || "Tickets & Tours",
    priceHeading: row.price_heading || `Compare ${row.name} Tickets`,
    priceSubheading: row.price_subheading || "",
    priceNote: row.price_note || "",
    faqEyebrow: row.faq_eyebrow || "FAQs",
    faqHeading: row.faq_heading || `${row.name} — Frequently Asked Questions`,
    ctaHeading: row.cta_heading || `Ready to visit ${row.name}?`,
    ctaSubtext: row.cta_subtext || "",
    ctaButtonText: row.cta_button_text || "Compare Tickets & Tours",
    nearbyHeadingOverride: row.nearby_heading_override || "",
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 4.7,
    reviewsCount: row.reviews_count || "10.2k",
    metaTitle: row.meta_title || row.name,
    metaDescription: row.meta_description || "",
    focusKeyword: row.focus_keyword || "visit museums",
    canonicalUrl: row.canonical_url || "",
    noIndex: !!row.no_index,
    noFollow: !!row.no_follow,
    ogTitle: row.og_title || row.meta_title || row.name,
    ogDescription: row.og_description || row.meta_description || "",
    ogImage: row.og_image || row.hero_image || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || ""),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || row.created_at || ""),
  };
}

export async function getMuseums(): Promise<Museum[]> {
  try {
    const rows = await sql`SELECT * FROM museums ORDER BY sort_order ASC, name ASC`;
    if (rows.length) return rows.map(rowToMuseum);
    return (museumsSeed as any[]).map(seedToMuseum);
  } catch {
    return (museumsSeed as any[]).map(seedToMuseum);
  }
}

export async function getMuseumBySlug(slug: string): Promise<Museum | null> {
  try {
    const rows = await sql`SELECT * FROM museums WHERE slug = ${slug} LIMIT 1`;
    if (rows.length) return rowToMuseum(rows[0]);
  } catch {
    // fall through to seed
  }
  const seed = (museumsSeed as any[]).find((m) => m.slug === slug);
  return seed ? seedToMuseum(seed) : null;
}

export async function getMuseumById(id: string): Promise<Museum | null> {
  try {
    const rows = await sql`SELECT * FROM museums WHERE id = ${id} LIMIT 1`;
    if (rows.length) return rowToMuseum(rows[0]);
  } catch {
    // fall through to seed
  }
  const seed = (museumsSeed as any[]).find((m) => m.id === id);
  return seed ? seedToMuseum(seed) : null;
}

// Single-row insert — appended at the end of the current sort order. This
// mirrors the reference repos' lesson (see lib/data.ts's insertTour comment):
// per-record CRUD, never a bulk-rewrite-the-whole-array save, which caused
// Neon serverless timeouts in earlier sites.
export async function insertMuseum(m: Museum): Promise<void> {
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM museums`;
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
      ${m.id}, ${m.slug}, ${m.name}, ${m.city}, ${m.country}, ${m.currencySymbol || "€"}, ${m.lat}, ${m.lng}, ${count as number}, ${!!m.featured},
      ${m.cardImage}, ${m.cardImageAlt}, ${m.cardTagline},
      ${m.heroBadge}, ${m.heroHeading}, ${m.heroSubheading}, ${m.heroImage}, ${m.heroImageAlt},
      ${m.highlightsEyebrow}, ${m.highlightsHeading}, ${m.highlightsSubheading}, ${JSON.stringify(m.highlights || [])}::jsonb,
      ${m.aboutHeading}, ${m.aboutBody}, ${m.toursEyebrow}, ${m.toursHeading}, ${m.toursSubheading},
      ${m.practicalHoursHeading}, ${JSON.stringify(m.practicalHours || [])}::jsonb, ${m.practicalHoursNote},
      ${m.practicalAddressHeading}, ${m.practicalAddress}, ${m.practicalGettingThere},
      ${m.practicalBestTimeHeading}, ${m.practicalBestTimeBody},
      ${m.priceEyebrow}, ${m.priceHeading}, ${m.priceSubheading}, ${m.priceNote},
      ${m.faqEyebrow}, ${m.faqHeading},
      ${m.ctaHeading}, ${m.ctaSubtext}, ${m.ctaButtonText}, ${m.nearbyHeadingOverride},
      ${m.rating ?? 4.7}, ${m.reviewsCount || "10.2k"},
      ${m.metaTitle}, ${m.metaDescription}, ${m.focusKeyword}, ${m.canonicalUrl || ""},
      ${!!m.noIndex}, ${!!m.noFollow}, ${m.ogTitle || ""}, ${m.ogDescription || ""}, ${m.ogImage || ""}
    )
  `;
}

export async function updateMuseum(id: string, m: Museum): Promise<void> {
  await sql`
    UPDATE museums SET
      slug = ${m.slug}, name = ${m.name}, city = ${m.city}, country = ${m.country},
      currency_symbol = ${m.currencySymbol || "€"},
      lat = ${m.lat}, lng = ${m.lng}, featured = ${!!m.featured},
      card_image = ${m.cardImage}, card_image_alt = ${m.cardImageAlt}, card_tagline = ${m.cardTagline},
      hero_badge = ${m.heroBadge}, hero_heading = ${m.heroHeading}, hero_subheading = ${m.heroSubheading},
      hero_image = ${m.heroImage}, hero_image_alt = ${m.heroImageAlt},
      highlights_eyebrow = ${m.highlightsEyebrow}, highlights_heading = ${m.highlightsHeading},
      highlights_subheading = ${m.highlightsSubheading}, highlights = ${JSON.stringify(m.highlights || [])}::jsonb,
      about_heading = ${m.aboutHeading}, about_body = ${m.aboutBody},
      tours_eyebrow = ${m.toursEyebrow}, tours_heading = ${m.toursHeading}, tours_subheading = ${m.toursSubheading},
      practical_hours_heading = ${m.practicalHoursHeading}, practical_hours = ${JSON.stringify(m.practicalHours || [])}::jsonb,
      practical_hours_note = ${m.practicalHoursNote},
      practical_address_heading = ${m.practicalAddressHeading}, practical_address = ${m.practicalAddress},
      practical_getting_there = ${m.practicalGettingThere},
      practical_best_time_heading = ${m.practicalBestTimeHeading}, practical_best_time_body = ${m.practicalBestTimeBody},
      price_eyebrow = ${m.priceEyebrow}, price_heading = ${m.priceHeading}, price_subheading = ${m.priceSubheading},
      price_note = ${m.priceNote},
      faq_eyebrow = ${m.faqEyebrow}, faq_heading = ${m.faqHeading},
      cta_heading = ${m.ctaHeading}, cta_subtext = ${m.ctaSubtext}, cta_button_text = ${m.ctaButtonText},
      nearby_heading_override = ${m.nearbyHeadingOverride},
      rating = ${m.rating ?? 4.7}, reviews_count = ${m.reviewsCount || "10.2k"},
      meta_title = ${m.metaTitle}, meta_description = ${m.metaDescription}, focus_keyword = ${m.focusKeyword},
      canonical_url = ${m.canonicalUrl || ""},
      no_index = ${!!m.noIndex}, no_follow = ${!!m.noFollow},
      og_title = ${m.ogTitle || ""}, og_description = ${m.ogDescription || ""}, og_image = ${m.ogImage || ""},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteMuseum(id: string): Promise<void> {
  await sql`DELETE FROM museums WHERE id = ${id}`;
  await sql`DELETE FROM museum_tours WHERE museum_id = ${id}`;
  await sql`DELETE FROM museum_faqs WHERE museum_id = ${id}`;
}

export async function reorderMuseums(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE museums SET sort_order = ${i} WHERE id = ${orderedIds[i]}`;
  }
}

export async function setMuseumIndexing(id: string, noIndex: boolean, noFollow: boolean): Promise<void> {
  await sql`
    UPDATE museums SET no_index = ${!!noIndex}, no_follow = ${!!noFollow} WHERE id = ${id}
  `;
}

/* ------------------------------------------------------------------ */
/* Tours (per-museum)                                                   */
/* ------------------------------------------------------------------ */

export interface TourRecord {
  id: string;
  museumId: string;
  badge?: string;
  ribbon?: string;
  title: string;
  description: string;
  includes: string[];
  highlights?: string[];
  excludes?: string[];
  duration?: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt: string;
  hrefPath?: string;
  hrefExtra?: string;
  href?: string;
  featured?: boolean;
  bestFor?: string;
  priceTableColumn1?: string;
  priceTableFeature?: string;
  category?: string;
}

export interface Tour extends TourRecord {
  href: string;
}

function rowToTour(row: any): TourRecord {
  return {
    id: row.id,
    museumId: row.museum_id,
    badge: row.badge || undefined,
    ribbon: row.ribbon || undefined,
    title: row.title,
    description: row.description,
    includes: parseJsonArray(row.includes),
    highlights: parseJsonArray(row.highlights),
    excludes: parseJsonArray(row.excludes),
    duration: row.duration || undefined,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    price: Number(row.price),
    originalPrice: row.original_price === null || row.original_price === undefined ? undefined : Number(row.original_price),
    image: row.image,
    imageAlt: row.image_alt,
    hrefPath: row.href_path || undefined,
    hrefExtra: row.href_extra || undefined,
    href: row.href_path && /^https?:\/\//i.test(row.href_path) ? row.href_path : undefined,
    featured: !!row.featured,
    bestFor: row.best_for || undefined,
    priceTableColumn1: row.price_table_column1 || undefined,
    priceTableFeature: row.price_table_feature || undefined,
    category: row.category || undefined,
  };
}

function seedToTourRecord(seed: any): TourRecord {
  return {
    id: seed.id,
    museumId: seed.museumId,
    badge: seed.badge,
    ribbon: seed.ribbon,
    title: seed.title,
    description: seed.description,
    includes: seed.includes || [],
    highlights: seed.highlights || [],
    excludes: seed.excludes || [],
    duration: seed.duration,
    rating: Number(seed.rating),
    reviews: Number(seed.reviews),
    price: Number(seed.price),
    originalPrice: seed.originalPrice,
    image: seed.image,
    imageAlt: seed.imageAlt,
    hrefPath: seed.hrefPath,
    hrefExtra: seed.hrefExtra,
    href: seed.href,
    featured: !!seed.featured,
    bestFor: seed.bestFor,
    priceTableColumn1: seed.priceTableColumn1,
    priceTableFeature: seed.priceTableFeature,
    category: seed.category,
  };
}

export function transformTour(t: TourRecord): Tour {
  const href = t.href || (t.hrefPath ? gygLink(t.hrefPath, t.hrefExtra) : "#tickets");
  return { ...t, href };
}

export async function getToursRawByMuseum(museumId: string): Promise<TourRecord[]> {
  try {
    const rows = await sql`SELECT * FROM museum_tours WHERE museum_id = ${museumId} ORDER BY sort_order ASC, id ASC`;
    if (rows.length) return rows.map(rowToTour);
  } catch {
    // fall through to seed
  }
  return (museumToursSeed as any[]).filter((t) => t.museumId === museumId).map(seedToTourRecord);
}

export async function getToursByMuseum(museumId: string): Promise<Tour[]> {
  const records = await getToursRawByMuseum(museumId);
  return records.map(transformTour);
}

// Flattened list of every tour across every museum, each labeled with its
// museum's name — used by the admin Blog Post editor's "recommended tour"
// dropdown, since a post can cross-sell any museum's tour regardless of
// which museum the post itself is about.
export async function getAllTours(): Promise<(Tour & { museumName: string })[]> {
  const museums = await getMuseums();
  const perMuseum = await Promise.all(
    museums.map(async (m) => {
      const tours = await getToursByMuseum(m.id);
      return tours.map((t) => ({ ...t, museumName: m.name }));
    })
  );
  return perMuseum.flat();
}

// Global lookup across every museum's tours — used by the blog's
// "recommended tour" cross-link, since a Post's recommendedTourId isn't
// scoped to a single museum.
export async function getTourById(id: string): Promise<Tour | null> {
  if (!id) return null;
  try {
    const rows = await sql`SELECT * FROM museum_tours WHERE id = ${id} LIMIT 1`;
    if (rows.length) return transformTour(rowToTour(rows[0]));
  } catch {
    // fall through to seed
  }
  const seed = (museumToursSeed as any[]).find((t) => t.id === id);
  return seed ? transformTour(seedToTourRecord(seed)) : null;
}

export async function insertTour(museumId: string, t: TourRecord): Promise<void> {
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM museum_tours WHERE museum_id = ${museumId}`;
  await sql`
    INSERT INTO museum_tours (
      id, museum_id, badge, ribbon, title, description, includes, highlights, excludes,
      duration, rating, reviews, price, original_price, image, image_alt, href_path,
      href_extra, featured, best_for, price_table_column1, price_table_feature, category, sort_order
    ) VALUES (
      ${t.id}, ${museumId}, ${t.badge || "self-guided"}, ${t.ribbon || null}, ${t.title}, ${t.description},
      ${JSON.stringify(t.includes || [])}::jsonb, ${JSON.stringify(t.highlights || [])}::jsonb, ${JSON.stringify(t.excludes || [])}::jsonb,
      ${t.duration || null}, ${t.rating}, ${t.reviews}, ${t.price}, ${t.originalPrice ?? null},
      ${t.image}, ${t.imageAlt}, ${t.hrefPath || t.href || ""}, ${t.hrefExtra || null},
      ${!!t.featured}, ${t.bestFor || ""}, ${t.priceTableColumn1 || ""}, ${t.priceTableFeature || ""},
      ${t.category || ""}, ${count as number}
    )
  `;
}

export async function updateTourRecord(id: string, t: TourRecord): Promise<void> {
  await sql`
    UPDATE museum_tours SET
      badge = ${t.badge || "self-guided"},
      ribbon = ${t.ribbon || null},
      title = ${t.title},
      description = ${t.description},
      includes = ${JSON.stringify(t.includes || [])}::jsonb,
      highlights = ${JSON.stringify(t.highlights || [])}::jsonb,
      excludes = ${JSON.stringify(t.excludes || [])}::jsonb,
      duration = ${t.duration || null},
      rating = ${t.rating},
      reviews = ${t.reviews},
      price = ${t.price},
      original_price = ${t.originalPrice ?? null},
      image = ${t.image},
      image_alt = ${t.imageAlt},
      href_path = ${t.hrefPath || t.href || ""},
      href_extra = ${t.hrefExtra || null},
      featured = ${!!t.featured},
      best_for = ${t.bestFor || ""},
      price_table_column1 = ${t.priceTableColumn1 || ""},
      price_table_feature = ${t.priceTableFeature || ""},
      category = ${t.category || ""}
    WHERE id = ${id}
  `;
}

export async function deleteTour(id: string): Promise<void> {
  await sql`DELETE FROM museum_tours WHERE id = ${id}`;
}

/* ------------------------------------------------------------------ */
/* FAQs (per-museum)                                                    */
/* ------------------------------------------------------------------ */

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

export async function getFaqsByMuseum(museumId: string): Promise<FAQ[]> {
  try {
    const rows = await sql`SELECT id, question, answer, category FROM museum_faqs WHERE museum_id = ${museumId} ORDER BY sort_order ASC, id ASC`;
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id as string,
        question: r.question as string,
        answer: r.answer as string,
        category: (r.category as string) || undefined,
      }));
    }
  } catch {
    // fall through to seed
  }
  return (museumFaqsSeed as any[]).filter((f) => f.museumId === museumId).map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
  }));
}

export async function saveFaqsForMuseum(museumId: string, faqs: FAQ[]): Promise<void> {
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    const id = f.id || `${museumId}-faq-${i + 1}`;
    await sql`
      INSERT INTO museum_faqs (id, museum_id, question, answer, category, sort_order)
      VALUES (${id}, ${museumId}, ${f.question}, ${f.answer}, ${f.category || ""}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        question = EXCLUDED.question,
        answer = EXCLUDED.answer,
        category = EXCLUDED.category,
        sort_order = EXCLUDED.sort_order
    `;
  }
  const existing = await sql`SELECT id FROM museum_faqs WHERE museum_id = ${museumId}`;
  const keepIds = faqs.map((f, i) => f.id || `${museumId}-faq-${i + 1}`);
  const toDelete = existing.map((r) => r.id as string).filter((id) => !keepIds.includes(id));
  for (const id of toDelete) {
    await sql`DELETE FROM museum_faqs WHERE id = ${id}`;
  }
}
