import { sql } from "./db";

/* ------------------------------------------------------------------ */
/* This is the SITE-WIDE landing-page content model — the museums grid */
/* homepage, header, footer, and theme. Unlike the single-attraction    */
/* reference repos (where "homepage" WAS the attraction page), each      */
/* museum has its own content in lib/museums.ts; this file only covers   */
/* the parts that wrap around the museum grid: hero banner, trust        */
/* section, CTA banner, blog teaser copy, 404 copy, header/footer nav,   */
/* and theme colors.                                                     */
/* ------------------------------------------------------------------ */

export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

export interface HeroFeature {
  title: string;
  subtitle: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HighlightCard {
  icon: string;
  title: string;
  body: string;
}

export interface HighlightsSection {
  eyebrow: string;
  heading: string;
  subheading: string;
  cards: HighlightCard[];
}

export interface GridSection {
  eyebrow: string;
  heading: string;
  subheading: string;
}

export interface CtaBannerSection {
  heading: string;
  subtext: string;
  buttonText: string;
  buttonHref: string;
}

export interface NotFoundSection {
  heading: string;
  body: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

export interface BlogTeaserSection {
  eyebrow: string;
  heading: string;
  subheading: string;
  viewAllText: string;
  readArticleText: string;
}

export interface BlogPageSection {
  eyebrow: string;
  heading: string;
  subheading: string;
  emptyStateText: string;
  featuredLinkText: string;
  ctaHeading: string;
  ctaButtonText: string;
  backToGuidesText: string;
  quickAnswerLabel: string;
  tocLabel: string;
  relatedGuidesHeading: string;
  sidebarRelatedHeading: string;
  sidebarRecommendedBadge: string;
  sidebarCompareLinkText: string;
  promoRecommendedText: string;
}

export interface HomepageSections {
  grid: GridSection;
  highlights: HighlightsSection;
  ctaBanner: CtaBannerSection;
  notFound: NotFoundSection;
  blogTeaser: BlogTeaserSection;
  blogPage: BlogPageSection;
}

export interface HeaderContent {
  logoImage: string;
  logoAlt: string;
  logoLine1: string;
  logoLine2: string;
  bookNowText: string;
  navLinks: NavLink[];
  ctaText: string;
  ctaHref: string;
}

export interface FooterContent {
  tagline: string;
  columns: FooterColumn[];
  addressHeading: string;
  addressLine1: string;
  addressLine2: string;
  copyrightText: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  dark: string;
  accent: string;
}

export interface HomepageContent {
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageAlt: string;
  heroGallery: GalleryImage[];
  heroFeatures: HeroFeature[];
  heroCtaPrimaryText: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryText: string;
  heroCtaSecondaryHref: string;
  ratingValue: string;
  ratingCount: string;
  sections: HomepageSections;
  header: HeaderContent;
  footer: FooterContent;
  theme: ThemeColors;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  noIndex: boolean;
  noFollow: boolean;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export const DEFAULT_HEADER: HeaderContent = {
  logoImage: "",
  logoAlt: "Visit Museums",
  logoLine1: "Visit",
  logoLine2: "Museums",
  bookNowText: "Book Tickets",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  ctaText: "Browse Museums",
  ctaHref: "/#museums",
};

export const DEFAULT_FOOTER: FooterContent = {
  tagline:
    "<strong>Your independent guide to museum & attraction tickets worldwide.</strong> We curate skip-the-line tickets, guided tours, and combo passes for the world's most iconic museums and cultural landmarks with verified authorized providers.",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "All Museums & Attractions", href: "/#museums" },
        { label: "Travel Blog & Guides", href: "/blog" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Site Info",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
      ],
    },
  ],
  addressHeading: "Visit Museums",
  addressLine1: "An independent global museum ticketing guide",
  addressLine2: "Covering iconic museums, galleries, and attractions worldwide",
  copyrightText:
    "Visit Museums. All prices shown in local currency where applicable. Ticket availability subject to each attraction's own quota rules and seasonal hours.",
};

export const DEFAULT_THEME: ThemeColors = {
  primary: "#1F2937",   // Gallery Charcoal
  secondary: "#B08D57", // Museum Gold
  dark: "#0F1419",      // Deep Ink
  accent: "#C0392B",    // Curator Red
};

export const DEFAULT_HERO_FEATURES: HeroFeature[] = [
  { title: "Official Tickets", subtitle: "100% Verified" },
  { title: "Skip The Line", subtitle: "Save time, see more" },
  { title: "Nearby Attractions", subtitle: "Plan a full day out" },
  { title: "24/7 Support", subtitle: "We're here to help" },
];

export const DEFAULT_SECTIONS: HomepageSections = {
  grid: {
    eyebrow: "Explore by Destination",
    heading: "Find Museum & Attraction Tickets Worldwide",
    subheading: "Skip-the-line tickets, guided tours, and combo passes for the world's most iconic museums and cultural landmarks.",
  },
  highlights: {
    eyebrow: "Why Book With Visit Museums",
    heading: "Plan a Better Museum Day",
    subheading: "We make it easy to compare official tickets and find other great sights nearby, so you spend less time in line and more time exploring.",
    cards: [
      { icon: "🎟️", title: "Skip-the-Line Tickets", body: "Compare verified skip-the-line tickets and guided tours for museums and attractions across the globe." },
      { icon: "📍", title: "Nearby Attractions", body: "Every museum page shows other great sights within walking or driving distance, calculated from real coordinates." },
      { icon: "🧭", title: "Practical Visitor Info", body: "Hours, addresses, and best-time-to-visit tips kept current for every destination we cover." },
      { icon: "💬", title: "Independent & Transparent", body: "We're not affiliated with any museum. Our comparisons and affiliate links are always clearly disclosed." },
    ],
  },
  ctaBanner: {
    heading: "Ready to plan your museum visit?",
    subtext: "Browse tickets and tours for top museums and attractions worldwide.",
    buttonText: "Explore Museums",
    buttonHref: "/#museums",
  },
  notFound: {
    heading: "This page seems to have wandered off the gallery floor.",
    body: "The page you are looking for does not exist or may have been moved. Explore our featured museums and attractions below.",
    primaryButtonText: "Browse Museums & Attractions →",
    primaryButtonHref: "/#museums",
    secondaryButtonText: "Read the Travel Guide",
    secondaryButtonHref: "/blog",
  },
  blogTeaser: {
    eyebrow: "Museum Travel Guides",
    heading: "Insider Guides for Museum Visitors",
    subheading: "Expert tips on booking tickets, avoiding queues, and planning your museum day.",
    viewAllText: "View All Guides",
    readArticleText: "Read Guide",
  },
  blogPage: {
    eyebrow: "Museum Travel & Ticket Guides",
    heading: "Museum Guides, Ticket Tips & Visitor Advice",
    subheading: "Everything you need to know to book the right ticket and experience the world's best museums like an insider.",
    emptyStateText: "No articles published yet — check back soon.",
    featuredLinkText: "Read the guide",
    ctaHeading: "Ready to plan your museum visit?",
    ctaButtonText: "Browse Museum Tickets →",
    backToGuidesText: "← All museum travel guides",
    quickAnswerLabel: "Quick Answer",
    tocLabel: "In This Guide",
    relatedGuidesHeading: "Related Guides",
    sidebarRelatedHeading: "Related Guides",
    sidebarRecommendedBadge: "Recommended",
    sidebarCompareLinkText: "Compare tickets & tours →",
    promoRecommendedText: "Recommended Tour",
  },
};

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadge: "VISIT MUSEUMS | TICKETS & TOURS WORLDWIDE",
  heroHeading: "Discover the World's Best Museums & Attractions",
  heroSubheading:
    "<p>Compare official skip-the-line tickets, guided tours, and combo passes for iconic museums and cultural landmarks — then find other great sights nearby.</p>",
  heroImage: "/images/hero-museums.jpg",
  heroImageAlt: "Grand museum gallery hall with visitors admiring artwork",
  heroGallery: [],
  heroFeatures: DEFAULT_HERO_FEATURES,
  heroCtaPrimaryText: "Explore Museums",
  heroCtaPrimaryHref: "#museums",
  heroCtaSecondaryText: "Read Travel Guides",
  heroCtaSecondaryHref: "/blog",
  ratingValue: "4.8 / 5",
  ratingCount: "From verified visitor reviews across our featured attractions",
  sections: DEFAULT_SECTIONS,
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  theme: DEFAULT_THEME,
  metaTitle: "Visit Museums | Museum & Attraction Tickets Worldwide 2026",
  metaDescription:
    "Compare official museum and attraction tickets, guided tours, and combo passes worldwide. Skip the line and find other great sights nearby with Visit Museums.",
  focusKeyword: "visit museums",
  noIndex: false,
  noFollow: false,
  canonicalUrl: "",
  ogTitle: "Visit Museums — Museum & Attraction Tickets Worldwide",
  ogDescription:
    "Compare skip-the-line tickets and guided tours for the world's best museums and attractions, and discover other great sights nearby.",
  ogImage: "/images/hero-museums.jpg",
};

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
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

function parseJsonWithDefault<T extends object>(value: unknown, fallback: T): T {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = null;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;
  return { ...fallback, ...(parsed as Partial<T>) };
}

function rowToHomepage(row: any): HomepageContent {
  const sectionsRaw = parseJsonWithDefault<HomepageSections>(row.sections_json, DEFAULT_SECTIONS);
  return {
    heroBadge: row.hero_badge || DEFAULT_HOMEPAGE_CONTENT.heroBadge,
    heroHeading: row.hero_heading || DEFAULT_HOMEPAGE_CONTENT.heroHeading,
    heroSubheading: row.hero_subheading || DEFAULT_HOMEPAGE_CONTENT.heroSubheading,
    heroImage: row.hero_image || DEFAULT_HOMEPAGE_CONTENT.heroImage,
    heroImageAlt: row.hero_image_alt || DEFAULT_HOMEPAGE_CONTENT.heroImageAlt,
    heroGallery: (() => {
      const g = parseArray<GalleryImage>(row.hero_gallery);
      return g.length ? g : DEFAULT_HOMEPAGE_CONTENT.heroGallery;
    })(),
    heroFeatures: (() => {
      const f = parseArray<HeroFeature>(row.hero_features);
      return f.length ? f : DEFAULT_HERO_FEATURES;
    })(),
    heroCtaPrimaryText: row.hero_cta_primary_text || DEFAULT_HOMEPAGE_CONTENT.heroCtaPrimaryText,
    heroCtaPrimaryHref: row.hero_cta_primary_href || DEFAULT_HOMEPAGE_CONTENT.heroCtaPrimaryHref,
    heroCtaSecondaryText: row.hero_cta_secondary_text || DEFAULT_HOMEPAGE_CONTENT.heroCtaSecondaryText,
    heroCtaSecondaryHref: row.hero_cta_secondary_href || DEFAULT_HOMEPAGE_CONTENT.heroCtaSecondaryHref,
    ratingValue: row.rating_value || DEFAULT_HOMEPAGE_CONTENT.ratingValue,
    ratingCount: row.rating_count || DEFAULT_HOMEPAGE_CONTENT.ratingCount,
    sections: {
      grid: { ...DEFAULT_SECTIONS.grid, ...sectionsRaw.grid },
      highlights: { ...DEFAULT_SECTIONS.highlights, ...sectionsRaw.highlights },
      ctaBanner: { ...DEFAULT_SECTIONS.ctaBanner, ...sectionsRaw.ctaBanner },
      notFound: { ...DEFAULT_SECTIONS.notFound, ...sectionsRaw.notFound },
      blogTeaser: { ...DEFAULT_SECTIONS.blogTeaser, ...sectionsRaw.blogTeaser },
      blogPage: { ...DEFAULT_SECTIONS.blogPage, ...sectionsRaw.blogPage },
    },
    header: parseJsonWithDefault<HeaderContent>(row.header_json, DEFAULT_HEADER),
    footer: parseJsonWithDefault<FooterContent>(row.footer_json, DEFAULT_FOOTER),
    theme: parseJsonWithDefault<ThemeColors>(row.theme_json, DEFAULT_THEME),
    metaTitle: row.meta_title || DEFAULT_HOMEPAGE_CONTENT.metaTitle,
    metaDescription: row.meta_description || DEFAULT_HOMEPAGE_CONTENT.metaDescription,
    focusKeyword: row.focus_keyword || DEFAULT_HOMEPAGE_CONTENT.focusKeyword,
    noIndex: !!row.no_index,
    noFollow: !!row.no_follow,
    canonicalUrl: row.canonical_url || "",
    ogTitle: row.og_title || DEFAULT_HOMEPAGE_CONTENT.ogTitle,
    ogDescription: row.og_description || DEFAULT_HOMEPAGE_CONTENT.ogDescription,
    ogImage: row.og_image || DEFAULT_HOMEPAGE_CONTENT.ogImage,
  };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const rows = await sql`SELECT * FROM homepage WHERE id = 1 LIMIT 1`;
    return rows.length ? rowToHomepage(rows[0]) : DEFAULT_HOMEPAGE_CONTENT;
  } catch {
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

export async function getSiteChrome(): Promise<{ header: HeaderContent; footer: FooterContent; theme: ThemeColors }> {
  try {
    const rows = await sql`SELECT header_json, footer_json, theme_json FROM homepage WHERE id = 1 LIMIT 1`;
    if (!rows.length) return { header: DEFAULT_HEADER, footer: DEFAULT_FOOTER, theme: DEFAULT_THEME };
    const row = rows[0] as any;
    return {
      header: parseJsonWithDefault<HeaderContent>(row.header_json, DEFAULT_HEADER),
      footer: parseJsonWithDefault<FooterContent>(row.footer_json, DEFAULT_FOOTER),
      theme: parseJsonWithDefault<ThemeColors>(row.theme_json, DEFAULT_THEME),
    };
  } catch {
    return { header: DEFAULT_HEADER, footer: DEFAULT_FOOTER, theme: DEFAULT_THEME };
  }
}

export async function saveHomepageCopy(data: {
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageAlt: string;
  heroGallery: GalleryImage[];
  heroFeatures: HeroFeature[];
  heroCtaPrimaryText: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryText: string;
  heroCtaSecondaryHref: string;
  ratingValue: string;
  ratingCount: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}): Promise<void> {
  await sql`
    INSERT INTO homepage (
      id, hero_badge, hero_heading, hero_subheading, hero_image, hero_image_alt,
      hero_gallery, hero_features, hero_cta_primary_text, hero_cta_primary_href,
      hero_cta_secondary_text, hero_cta_secondary_href,
      rating_value, rating_count, meta_title, meta_description, focus_keyword,
      canonical_url, og_title, og_description, og_image
    ) VALUES (
      1, ${data.heroBadge}, ${data.heroHeading}, ${data.heroSubheading}, ${data.heroImage},
      ${data.heroImageAlt}, ${JSON.stringify(data.heroGallery || [])}::jsonb,
      ${JSON.stringify(data.heroFeatures || [])}::jsonb,
      ${data.heroCtaPrimaryText || ""}, ${data.heroCtaPrimaryHref || ""},
      ${data.heroCtaSecondaryText || ""}, ${data.heroCtaSecondaryHref || ""},
      ${data.ratingValue}, ${data.ratingCount},
      ${data.metaTitle || ""}, ${data.metaDescription || ""}, ${data.focusKeyword || ""},
      ${data.canonicalUrl || ""}, ${data.ogTitle || ""}, ${data.ogDescription || ""}, ${data.ogImage || ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      hero_badge = EXCLUDED.hero_badge,
      hero_heading = EXCLUDED.hero_heading,
      hero_subheading = EXCLUDED.hero_subheading,
      hero_image = EXCLUDED.hero_image,
      hero_image_alt = EXCLUDED.hero_image_alt,
      hero_gallery = EXCLUDED.hero_gallery,
      hero_features = EXCLUDED.hero_features,
      hero_cta_primary_text = EXCLUDED.hero_cta_primary_text,
      hero_cta_primary_href = EXCLUDED.hero_cta_primary_href,
      hero_cta_secondary_text = EXCLUDED.hero_cta_secondary_text,
      hero_cta_secondary_href = EXCLUDED.hero_cta_secondary_href,
      rating_value = EXCLUDED.rating_value,
      rating_count = EXCLUDED.rating_count,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      focus_keyword = EXCLUDED.focus_keyword,
      canonical_url = EXCLUDED.canonical_url,
      og_title = EXCLUDED.og_title,
      og_description = EXCLUDED.og_description,
      og_image = EXCLUDED.og_image
  `;
}

export async function setHomepageIndexing(noIndex: boolean, noFollow: boolean): Promise<void> {
  await sql`
    INSERT INTO homepage (id, no_index, no_follow)
    VALUES (1, ${!!noIndex}, ${!!noFollow})
    ON CONFLICT (id) DO UPDATE SET
      no_index = EXCLUDED.no_index,
      no_follow = EXCLUDED.no_follow
  `;
}

export async function saveHomepageSections(sections: HomepageSections): Promise<void> {
  await sql`
    INSERT INTO homepage (id, sections_json)
    VALUES (1, ${JSON.stringify(sections)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET sections_json = EXCLUDED.sections_json
  `;
}

export async function saveSiteHeader(header: HeaderContent): Promise<void> {
  await sql`
    INSERT INTO homepage (id, header_json)
    VALUES (1, ${JSON.stringify(header)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET header_json = EXCLUDED.header_json
  `;
}

export async function saveSiteFooter(footer: FooterContent): Promise<void> {
  await sql`
    INSERT INTO homepage (id, footer_json)
    VALUES (1, ${JSON.stringify(footer)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET footer_json = EXCLUDED.footer_json
  `;
}

export async function saveSiteTheme(theme: ThemeColors): Promise<void> {
  await sql`
    INSERT INTO homepage (id, theme_json)
    VALUES (1, ${JSON.stringify(theme)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET theme_json = EXCLUDED.theme_json
  `;
}
