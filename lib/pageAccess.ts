export const PAGE_KEYS = ["homepage", "museums", "posts", "privacy", "about", "contact", "pages"] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  homepage: "Homepage",
  museums: "Museums & Attractions",
  posts: "Blog Posts",
  privacy: "Privacy Policy",
  about: "About Page",
  contact: "Contact Page",
  pages: "Blog Page SEO",
};

export function isPageKey(value: unknown): value is PageKey {
  return typeof value === "string" && (PAGE_KEYS as readonly string[]).includes(value);
}
