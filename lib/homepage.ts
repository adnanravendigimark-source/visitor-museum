import { cache } from "react";
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
  // The two tilted "polaroid" photos in this section (CulturalJourneyBanner.tsx)
  // and the italic caption under the front one — previously hardcoded image
  // paths with no admin control at all.
  polaroidImage1: string;
  polaroidImage1Alt: string;
  polaroidImage2: string;
  polaroidImage2Alt: string;
  polaroidCaption: string;
}

export interface GridSection {
  eyebrow: string;
  heading: string;
  subheading: string;
}

export interface BlogTeaserSection {
  eyebrow: string;
  heading: string;
  subheading: string;
  viewAllText: string;
  readArticleText: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: FaqItem[];
}

export interface PopularCountryItem {
  // Must match a real museum's `country` field (picked from a dropdown in
  // the admin, not free text) so its "View" link and live museum/city
  // counts always resolve to something real — see getPopularCountries() in
  // lib/museums.ts, which computes those counts fresh from the museum
  // catalog rather than storing them here.
  country: string;
  // Optional overrides — leave blank to fall back to the country's own
  // "Featured" (or first) museum's card photo, and to an auto "X museums ·
  // Y cities" caption.
  image: string;
  imageAlt: string;
  tagline: string;
}

export interface PopularCountriesSection {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  subheading: string;
  viewAllText: string;
  viewAllHref: string;
  // Admin-curated country cards, in display order. When empty, the
  // homepage section falls back to fully automatic mode (top 6 countries
  // by museum count) — see components/PopularCountries.tsx — so a brand
  // new install still shows something useful before anyone's touched this.
  items: PopularCountryItem[];
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

export interface HomepageSections {
  grid: GridSection;
  highlights: HighlightsSection;
  popularCountries: PopularCountriesSection;
  blogTeaser: BlogTeaserSection;
  faq: FaqSection;
  ctaBanner: CtaBannerSection;
  notFound: NotFoundSection;
}

export interface HeaderContent {
  logoImage: string;
  logoAlt: string;
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
}

export interface HomepageContent {
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageAlt: string;
  heroFeatures: HeroFeature[];
  heroCtaPrimaryText: string;
  heroCtaPrimaryHref: string;
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

// navLinks is the FULL header nav list, in order — museum ticket links and
// everything else (About Us, Blog, ...) are all just plain entries here,
// edited in Homepage admin -> Navbar -> "Nav links". DEFAULT_HEADER only
// covers the non-museum pages, since a brand-new install has no museums
// yet to link to.
export const DEFAULT_HEADER: HeaderContent = {
  logoImage: "",
  logoAlt: "Visit Museums",
  bookNowText: "Explore Museums",
  navLinks: [
    { label: "All Museums", href: "/museums" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  ctaText: "Explore Museums",
  ctaHref: "/#museums",
};

export const DEFAULT_FOOTER: FooterContent = {
  tagline:
    "<strong>Your independent guide to museum & attraction tickets worldwide.</strong> We curate skip-the-line tickets, guided tours, and combo passes for the world's most iconic museums and cultural landmarks with verified authorized providers.",
  columns: [
    {
      title: "Popular Museums",
      links: [
        { label: "Louvre Museum", href: "/louvre-museum-tickets-tour" },
        { label: "Duomo Florence", href: "/duomo-florence-tickets" },
        { label: "Uffizi Gallery", href: "/uffizi-gallery-museum-tickets-tour" },
        { label: "Lindt Home of Chocolate", href: "/lindt-home-of-chocolate" },
        { label: "Van Gogh Museum", href: "/van-gogh-museum-tickets-tour" },
      ],
    },
    {
      title: "Popular Guides",
      links: [
        { label: "Why You Must Visit Museums", href: "/why-one-must-visit-museums" },
        { label: "Best Time to Visit Amsterdam", href: "/best-time-to-visit-amsterdam" },
        { label: "Best Time to Visit Louvre", href: "/best-time-to-visit-louvre-museum" },
        { label: "Best Time to Visit Uffizi", href: "/best-time-to-visit-uffizi-gallery" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy-policy" },
      ],
    },
  ],
  addressHeading: "Visit Museums",
  addressLine1: "An independent global museum ticketing guide",
  addressLine2: "Covering iconic museums, galleries, and attractions worldwide",
  copyrightText:
    "Visit Museums. All rights reserved. All prices shown in local currency where applicable.",
};

export const DEFAULT_THEME: ThemeColors = {
  primary: "#2D903A",   // Brand Green
  secondary: "#1e4945", // Dark Teal
  dark: "#1F2429",      // Dark Slate
};

export const DEFAULT_HERO_FEATURES: HeroFeature[] = [
  { title: "Trusted Tickets", subtitle: "100% Verified" },
  { title: "Easy Booking", subtitle: "Instant confirmation" },
  { title: "Best Prices", subtitle: "Guaranteed value" },
];

export const DEFAULT_SECTIONS: HomepageSections = {
  grid: {
    eyebrow: "POPULAR MUSEUMS",
    heading: "Explore the World's Best Museums",
    subheading: "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.",
  },
  highlights: {
    eyebrow: "YOUR NEXT CULTURAL JOURNEY",
    heading: "Plan Your Museum Adventure",
    subheading: "Get the latest museum news, travel tips, exhibition highlights and insider guides — all in one place.",
    cards: [
      { icon: "🏛️", title: "Museum Guides", body: "Tips for your next trip" },
      { icon: "📰", title: "Latest News", body: "Updates & exhibitions" },
      { icon: "🗝️", title: "Insider Tips", body: "Make the most of your visit" },
      { icon: "🧳", title: "Travel Inspiration", body: "Discover new places" },
    ],
    polaroidImage1: "/images/gallery-corridor.jpg",
    polaroidImage1Alt: "Grand museum corridor",
    polaroidImage2: "/images/david-sculpture.jpg",
    polaroidImage2Alt: "Michelangelo David sculpture",
    polaroidCaption: "Art inspires",
  },
  popularCountries: {
    enabled: true,
    eyebrow: "WHERE TO GO",
    heading: "Popular Countries",
    subheading: "Browse museums and attractions by destination — pick a country to see every ticket and tour we cover there.",
    viewAllText: "View All Museums",
    viewAllHref: "/museums",
    items: [],
  },
  blogTeaser: {
    eyebrow: "TRAVEL GUIDES",
    heading: "Popular Articles & Guides",
    subheading: "Tips and travel insights to help you plan the best museum visits worldwide.",
    viewAllText: "View All Articles",
    readArticleText: "Read More",
  },
  faq: {
    eyebrow: "GOT QUESTIONS?",
    heading: "Frequently Asked Questions",
    subheading: "Everything you need to know before booking your museum tickets with us.",
    items: [
      {
        question: "Is Visit Museums the museum's ticket seller?",
        answer:
          "<p>No — we're an independent affiliate guide, not the museum or an official ticket seller. We compare skip-the-line tickets and guided tours from verified, authorized providers for museums and attractions worldwide and link you through to book directly with them; we don't print or issue tickets ourselves.</p>",
      },
      {
        question: "Are the tickets shown on Visit Museums genuine and valid?",
        answer:
          "<p>Yes. Every ticket and tour listed links out to a trusted, authorized provider, so you always book directly with them and receive a confirmed booking straight from them.</p>",
      },
      {
        question: "Can I cancel or get a refund on my booking?",
        answer:
          "<p>Cancellation and refund policies are set by the ticket provider, not by Visit Museums. Check the terms shown on the provider's booking page before you confirm.</p>",
      },
      {
        question: "Do I need to print my ticket, or is mobile OK?",
        answer:
          "<p>Most providers accept a ticket shown on your phone, but this varies by museum. Check the specific ticket's details on the provider's page for entry requirements.</p>",
      },
    ],
  },
  ctaBanner: {
    heading: "Plan Your Museum Adventure",
    subtext: "Get the latest museum news, travel tips, exhibition highlights and insider guides — all in one place.",
    buttonText: "Explore Articles →",
    buttonHref: "/blog",
  },
  notFound: {
    heading: "This page seems to have wandered off the gallery floor.",
    body: "The page you are looking for does not exist or may have been moved. Explore our featured museums and attractions below.",
    primaryButtonText: "Browse Museums & Attractions →",
    primaryButtonHref: "/#museums",
    secondaryButtonText: "Read Travel Guides",
    secondaryButtonHref: "/blog",
  },
};

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadge: "WORLD-CLASS MUSEUMS, UNFORGETTABLE EXPERIENCES",
  heroHeading: "Discover the World's Most Iconic Museums",
  heroSubheading:
    "<p>From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.</p>",
  heroImage: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?q=80&w=1600&auto=format&fit=crop",
  heroImageAlt: "Louvre Museum Paris glass pyramid at sunset",
  heroFeatures: DEFAULT_HERO_FEATURES,
  heroCtaPrimaryText: "Explore Museums",
  heroCtaPrimaryHref: "#museums",
  sections: DEFAULT_SECTIONS,
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  theme: DEFAULT_THEME,
  metaTitle: "Visit Museums | Discover the World's Most Iconic Museums",
  metaDescription:
    "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.",
  focusKeyword: "visit museums",
  noIndex: false,
  noFollow: false,
  canonicalUrl: "",
  ogTitle: "Visit Museums | Discover the World's Most Iconic Museums",
  ogDescription:
    "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.",
  ogImage: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?q=80&w=1600&auto=format&fit=crop",
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
    heroFeatures: (() => {
      const f = parseArray<HeroFeature>(row.hero_features);
      return f.length ? f : DEFAULT_HERO_FEATURES;
    })(),
    heroCtaPrimaryText: row.hero_cta_primary_text || DEFAULT_HOMEPAGE_CONTENT.heroCtaPrimaryText,
    heroCtaPrimaryHref: row.hero_cta_primary_href || DEFAULT_HOMEPAGE_CONTENT.heroCtaPrimaryHref,
    sections: {
      grid: { ...DEFAULT_SECTIONS.grid, ...sectionsRaw.grid },
      highlights: { ...DEFAULT_SECTIONS.highlights, ...sectionsRaw.highlights },
      popularCountries: { ...DEFAULT_SECTIONS.popularCountries, ...sectionsRaw.popularCountries },
      blogTeaser: { ...DEFAULT_SECTIONS.blogTeaser, ...sectionsRaw.blogTeaser },
      faq: { ...DEFAULT_SECTIONS.faq, ...sectionsRaw.faq },
      ctaBanner: { ...DEFAULT_SECTIONS.ctaBanner, ...sectionsRaw.ctaBanner },
      notFound: { ...DEFAULT_SECTIONS.notFound, ...sectionsRaw.notFound },
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

// cache()-wrapped: getHomepageContent() is independently called from five
// separate components (CtaBanner, SiteFaqSection, CulturalJourneyBanner,
// not-found, and the homepage itself) — any single page render that mounts
// more than one of these now shares a single query instead of re-fetching
// per component.
async function getHomepageContentImpl(): Promise<HomepageContent> {
  try {
    const rows = await sql`SELECT * FROM homepage WHERE id = 1 LIMIT 1`;
    return rows.length ? rowToHomepage(rows[0]) : DEFAULT_HOMEPAGE_CONTENT;
  } catch {
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}
export const getHomepageContent = cache(getHomepageContentImpl);

async function getSiteChromeImpl(): Promise<{ header: HeaderContent; footer: FooterContent; theme: ThemeColors }> {
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
export const getSiteChrome = cache(getSiteChromeImpl);

export async function saveHomepageCopy(data: {
  heroBadge: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageAlt: string;
  heroFeatures: HeroFeature[];
  heroCtaPrimaryText: string;
  heroCtaPrimaryHref: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}): Promise<void> {
  // Note: the "homepage" table still has hero_gallery, hero_cta_secondary_*,
  // and rating_value/rating_count columns (all NOT NULL DEFAULT) left over
  // from fields that were removed from the admin UI because nothing on the
  // public site ever rendered them. They're intentionally left unwritten
  // here rather than dropped via migration, to avoid an unnecessary schema
  // change against a live database.
  await sql`
    INSERT INTO homepage (
      id, hero_badge, hero_heading, hero_subheading, hero_image, hero_image_alt,
      hero_features, hero_cta_primary_text, hero_cta_primary_href,
      meta_title, meta_description, focus_keyword,
      canonical_url, og_title, og_description, og_image
    ) VALUES (
      1, ${data.heroBadge}, ${data.heroHeading}, ${data.heroSubheading}, ${data.heroImage},
      ${data.heroImageAlt},
      ${JSON.stringify(data.heroFeatures || [])}::jsonb,
      ${data.heroCtaPrimaryText || ""}, ${data.heroCtaPrimaryHref || ""},
      ${data.metaTitle || ""}, ${data.metaDescription || ""}, ${data.focusKeyword || ""},
      ${data.canonicalUrl || ""}, ${data.ogTitle || ""}, ${data.ogDescription || ""}, ${data.ogImage || ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      hero_badge = EXCLUDED.hero_badge,
      hero_heading = EXCLUDED.hero_heading,
      hero_subheading = EXCLUDED.hero_subheading,
      hero_image = EXCLUDED.hero_image,
      hero_image_alt = EXCLUDED.hero_image_alt,
      hero_features = EXCLUDED.hero_features,
      hero_cta_primary_text = EXCLUDED.hero_cta_primary_text,
      hero_cta_primary_href = EXCLUDED.hero_cta_primary_href,
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
  // Explicitly rebuilt from only the real HeaderContent fields (rather than
  // spreading `header` through as-is) so any stray legacy keys — e.g. an
  // older header_json row seeded by scripts/sync-content.mjs's
  // buttonText/buttonHref/brandName/searchPlaceholder shape, which
  // parseJsonWithDefault doesn't strip on read — get scrubbed out the next
  // time this saves, instead of being silently carried forward forever.
  const clean: HeaderContent = {
    logoImage: header.logoImage || "",
    logoAlt: header.logoAlt || "",
    bookNowText: header.bookNowText || "",
    navLinks: header.navLinks || [],
    ctaText: header.ctaText || "",
    ctaHref: header.ctaHref || "",
  };
  await sql`
    INSERT INTO homepage (id, header_json)
    VALUES (1, ${JSON.stringify(clean)}::jsonb)
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
