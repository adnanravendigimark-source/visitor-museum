import { sql } from "./db";

export interface BlogSeoSettings {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const DEFAULT_SETTINGS: BlogSeoSettings = {
  metaTitle: "Visit Museums Blog | Tickets, Tips & Guides (2026)",
  metaDescription:
    "Comprehensive travel and visitor guides for museum and attraction tickets worldwide — skip-the-line strategies, combo passes, and practical visiting tips.",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

export async function getBlogSeoSettings(): Promise<BlogSeoSettings> {
  try {
    const rows = await sql`SELECT * FROM site_settings WHERE id = 1 LIMIT 1`;
    if (!rows.length) return DEFAULT_SETTINGS;
    const row = rows[0] as any;
    return {
      metaTitle: row.blog_meta_title || DEFAULT_SETTINGS.metaTitle,
      metaDescription: row.blog_meta_description || DEFAULT_SETTINGS.metaDescription,
      canonicalUrl: row.blog_canonical_url || "",
      noIndex: !!row.blog_no_index,
      noFollow: !!row.blog_no_follow,
      ogTitle: row.blog_og_title || "",
      ogDescription: row.blog_og_description || "",
      ogImage: row.blog_og_image || "",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setBlogIndexing(noIndex: boolean, noFollow: boolean): Promise<void> {
  await sql`
    INSERT INTO site_settings (id, blog_no_index, blog_no_follow)
    VALUES (1, ${!!noIndex}, ${!!noFollow})
    ON CONFLICT (id) DO UPDATE SET
      blog_no_index = EXCLUDED.blog_no_index,
      blog_no_follow = EXCLUDED.blog_no_follow
  `;
}

export async function saveBlogSeoSettings(data: BlogSeoSettings): Promise<void> {
  await sql`
    INSERT INTO site_settings (
      id, blog_meta_title, blog_meta_description, blog_canonical_url,
      blog_no_index, blog_no_follow, blog_og_title, blog_og_description, blog_og_image
    ) VALUES (
      1, ${data.metaTitle}, ${data.metaDescription}, ${data.canonicalUrl || ""},
      ${!!data.noIndex}, ${!!data.noFollow}, ${data.ogTitle || ""},
      ${data.ogDescription || ""}, ${data.ogImage || ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      blog_meta_title = EXCLUDED.blog_meta_title,
      blog_meta_description = EXCLUDED.blog_meta_description,
      blog_canonical_url = EXCLUDED.blog_canonical_url,
      blog_no_index = EXCLUDED.blog_no_index,
      blog_no_follow = EXCLUDED.blog_no_follow,
      blog_og_title = EXCLUDED.blog_og_title,
      blog_og_description = EXCLUDED.blog_og_description,
      blog_og_image = EXCLUDED.blog_og_image
  `;
}
