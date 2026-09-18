// cache() was removed from the exports below — see the note in
// lib/museums.ts for why: these functions are also called from Route
// Handlers, where cache()'s per-request memoization is not reliable and
// caused stale reads after admin writes.
import { sql } from "./db";
import { gygLink, type Tour } from "./museums";

// Other Attractions — replaces the old auto-resolved "Nearby Attractions"
// feature (which pulled real places live from OpenStreetMap by
// coordinate). Managed exactly like a museum's own tours/tickets
// (museum_tours): each record belongs to exactly one museum, added and
// edited from that museum's own "Manage Other Attractions" screen (see
// /admin/attractions/[museumId] and MuseumForm.tsx's "Other Attractions"
// section). Nothing is looked up or guessed — name, photo, price, and the
// booking link are all typed in by hand, same as a tour.
export interface OtherAttractionRecord {
  id: string;
  museumId: string;
  badge?: string;
  ribbon?: string;
  title: string;
  description: string;
  includes: string[];
  duration?: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt: string;
  hrefPath?: string;
  hrefExtra?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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

function rowToAttraction(row: any): OtherAttractionRecord {
  return {
    id: row.id,
    museumId: row.museum_id,
    badge: row.badge || undefined,
    ribbon: row.ribbon || undefined,
    title: row.title,
    description: row.description || "",
    includes: parseJsonArray(row.includes),
    duration: row.duration || undefined,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    price: Number(row.price),
    originalPrice: row.original_price === null || row.original_price === undefined ? undefined : Number(row.original_price),
    image: row.image || "",
    imageAlt: row.image_alt || "",
    hrefPath: row.href_path || undefined,
    hrefExtra: row.href_extra || undefined,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || ""),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || row.created_at || ""),
  };
}

// Same shape TourCard.tsx already renders — reusing it directly means the
// "Other Attractions" cards are visually identical to the museum's own
// ticket cards, with zero duplicated card markup.
export function toTourCardShape(a: OtherAttractionRecord): Tour {
  const href = a.hrefPath && /^https?:\/\//i.test(a.hrefPath) ? a.hrefPath : gygLink(a.hrefPath || "", a.hrefExtra);
  return {
    id: a.id,
    museumId: a.museumId,
    badge: a.badge,
    ribbon: a.ribbon,
    title: a.title,
    description: a.description,
    includes: a.includes,
    duration: a.duration,
    rating: a.rating,
    reviews: a.reviews,
    price: a.price,
    originalPrice: a.originalPrice,
    image: a.image,
    imageAlt: a.imageAlt,
    hrefPath: a.hrefPath,
    hrefExtra: a.hrefExtra,
    href,
  };
}

async function getOtherAttractionsRawByMuseumImpl(museumId: string): Promise<OtherAttractionRecord[]> {
  try {
    const rows = await sql`SELECT * FROM other_attractions WHERE museum_id = ${museumId} ORDER BY sort_order ASC, id ASC`;
    return rows.map(rowToAttraction);
  } catch {
    return [];
  }
}
export const getOtherAttractionsByMuseum = getOtherAttractionsRawByMuseumImpl;

// Every attraction across every museum, each labeled with its museum's
// name/city/country — used by the admin hub page (/admin/attractions) to
// show a per-museum attraction count without an extra round trip per
// museum.
async function getAllOtherAttractionsImpl(): Promise<OtherAttractionRecord[]> {
  try {
    const rows = await sql`SELECT * FROM other_attractions ORDER BY museum_id ASC, sort_order ASC, id ASC`;
    return rows.map(rowToAttraction);
  } catch {
    return [];
  }
}
export const getAllOtherAttractions = getAllOtherAttractionsImpl;

async function getOtherAttractionByIdImpl(id: string): Promise<OtherAttractionRecord | null> {
  try {
    const rows = await sql`SELECT * FROM other_attractions WHERE id = ${id} LIMIT 1`;
    if (rows.length) return rowToAttraction(rows[0]);
  } catch {
    // fall through
  }
  return null;
}
export const getOtherAttractionById = getOtherAttractionByIdImpl;

export async function insertOtherAttraction(museumId: string, a: OtherAttractionRecord): Promise<void> {
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM other_attractions WHERE museum_id = ${museumId}`;
  await sql`
    INSERT INTO other_attractions (
      id, museum_id, badge, ribbon, title, description, includes, duration,
      rating, reviews, price, original_price, image, image_alt,
      href_path, href_extra, sort_order
    ) VALUES (
      ${a.id}, ${museumId}, ${a.badge || null}, ${a.ribbon || null}, ${a.title}, ${a.description},
      ${JSON.stringify(a.includes || [])}::jsonb, ${a.duration || null},
      ${a.rating}, ${a.reviews}, ${a.price}, ${a.originalPrice ?? null}, ${a.image}, ${a.imageAlt},
      ${a.hrefPath || ""}, ${a.hrefExtra || null}, ${count as number}
    )
  `;
}

export async function updateOtherAttraction(id: string, a: OtherAttractionRecord): Promise<void> {
  await sql`
    UPDATE other_attractions SET
      badge = ${a.badge || null},
      ribbon = ${a.ribbon || null},
      title = ${a.title},
      description = ${a.description},
      includes = ${JSON.stringify(a.includes || [])}::jsonb,
      duration = ${a.duration || null},
      rating = ${a.rating},
      reviews = ${a.reviews},
      price = ${a.price},
      original_price = ${a.originalPrice ?? null},
      image = ${a.image},
      image_alt = ${a.imageAlt},
      href_path = ${a.hrefPath || ""},
      href_extra = ${a.hrefExtra || null},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteOtherAttraction(id: string): Promise<void> {
  await sql`DELETE FROM other_attractions WHERE id = ${id}`;
}
