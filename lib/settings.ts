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
  // Content shown on the Blog listing page's hero banner and sidebar promo
  // card — kept alongside the SEO fields here rather than in
  // lib/homepage.ts's HomepageSections, since this admin page ("Blog Page
  // SEO") is already the one place that owns everything about the /blog
  // listing page itself.
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  emptyStateText: string;
  ctaButtonText: string;
  ctaButtonHref: string;
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
  heroEyebrow: "MUSEUM TRAVEL GUIDES",
  heroHeading: "Insider Guides for Museum Visitors",
  heroSubheading:
    "Expert tips on booking tickets, avoiding queues, and planning your museum day — written by people who actually visit these places.",
  emptyStateText: "No guides published yet — check back soon for new museum travel guides!",
  ctaButtonText: "Browse Museum Tickets →",
  ctaButtonHref: "/",
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
      heroEyebrow: row.blog_hero_eyebrow || DEFAULT_SETTINGS.heroEyebrow,
      heroHeading: row.blog_hero_heading || DEFAULT_SETTINGS.heroHeading,
      heroSubheading: row.blog_hero_subheading || DEFAULT_SETTINGS.heroSubheading,
      emptyStateText: row.blog_empty_state_text || DEFAULT_SETTINGS.emptyStateText,
      ctaButtonText: row.blog_cta_button_text || DEFAULT_SETTINGS.ctaButtonText,
      ctaButtonHref: row.blog_cta_button_href || DEFAULT_SETTINGS.ctaButtonHref,
    };
  } catch {
    // Also covers a DB that hasn't had `node scripts/setup-db.mjs` re-run
    // since the blog_hero_* columns were added — falls back to defaults
    // rather than a 500, same as every other getX() in this codebase.
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
      blog_no_index, blog_no_follow, blog_og_title, blog_og_description, blog_og_image,
      blog_hero_eyebrow, blog_hero_heading, blog_hero_subheading,
      blog_empty_state_text, blog_cta_button_text, blog_cta_button_href
    ) VALUES (
      1, ${data.metaTitle}, ${data.metaDescription}, ${data.canonicalUrl || ""},
      ${!!data.noIndex}, ${!!data.noFollow}, ${data.ogTitle || ""},
      ${data.ogDescription || ""}, ${data.ogImage || ""},
      ${data.heroEyebrow || ""}, ${data.heroHeading || ""}, ${data.heroSubheading || ""},
      ${data.emptyStateText || ""}, ${data.ctaButtonText || ""}, ${data.ctaButtonHref || ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      blog_meta_title = EXCLUDED.blog_meta_title,
      blog_meta_description = EXCLUDED.blog_meta_description,
      blog_canonical_url = EXCLUDED.blog_canonical_url,
      blog_no_index = EXCLUDED.blog_no_index,
      blog_no_follow = EXCLUDED.blog_no_follow,
      blog_og_title = EXCLUDED.blog_og_title,
      blog_og_description = EXCLUDED.blog_og_description,
      blog_og_image = EXCLUDED.blog_og_image,
      blog_hero_eyebrow = EXCLUDED.blog_hero_eyebrow,
      blog_hero_heading = EXCLUDED.blog_hero_heading,
      blog_hero_subheading = EXCLUDED.blog_hero_subheading,
      blog_empty_state_text = EXCLUDED.blog_empty_state_text,
      blog_cta_button_text = EXCLUDED.blog_cta_button_text,
      blog_cta_button_href = EXCLUDED.blog_cta_button_href
  `;
}
