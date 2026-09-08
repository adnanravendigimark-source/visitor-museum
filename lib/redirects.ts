import { sql } from "./db";

export async function recordSlugRename(oldSlug: string, newSlug: string): Promise<void> {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;
  try {
    await sql`
      INSERT INTO post_redirects (old_slug, new_slug) VALUES (${oldSlug}, ${newSlug})
      ON CONFLICT (old_slug) DO UPDATE SET new_slug = EXCLUDED.new_slug, created_at = now()
    `;
    await sql`UPDATE post_redirects SET new_slug = ${newSlug} WHERE new_slug = ${oldSlug} AND old_slug != ${newSlug}`;
  } catch {
    // Fail soft if schema is behind
  }
}

export async function getRedirectTarget(oldSlug: string): Promise<string | undefined> {
  try {
    const rows = await sql`SELECT new_slug FROM post_redirects WHERE old_slug = ${oldSlug} LIMIT 1`;
    return rows.length ? (rows[0].new_slug as string) : undefined;
  } catch {
    return undefined;
  }
}

export interface PostRedirectRow {
  oldSlug: string;
  newSlug: string;
  createdAt: string;
}

export async function getAllRedirects(): Promise<PostRedirectRow[]> {
  try {
    const rows = await sql`SELECT old_slug, new_slug, created_at FROM post_redirects ORDER BY created_at DESC`;
    return rows.map((r) => ({
      oldSlug: r.old_slug as string,
      newSlug: r.new_slug as string,
      createdAt: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "",
    }));
  } catch {
    return [];
  }
}
