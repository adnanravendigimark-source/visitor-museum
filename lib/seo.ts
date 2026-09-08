import { SITE_URL } from "./site";

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveRobots(
  noIndex: boolean,
  noFollow: boolean = noIndex
): { index: boolean; follow: boolean } {
  return { index: !noIndex, follow: !noFollow };
}

export function resolveCanonical(path: string, override?: string | null): string {
  const trimmed = (override || "").trim();
  if (trimmed) return trimmed;
  const cleanPath = path === "/" ? "" : path;
  return `${SITE_URL}${cleanPath}`;
}

export function resolveAbsoluteUrl(url?: string | null): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export interface OgFields {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function resolveOg(
  fields: OgFields,
  fallback: { title: string; description: string; image?: string }
) {
  return {
    title: fields.ogTitle?.trim() || fallback.title,
    description: fields.ogDescription?.trim() || fallback.description,
    image: fields.ogImage?.trim() || fallback.image || "",
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function buildArticleJsonLd(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName: string;
  siteName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    ...(article.image ? { image: [article.image] } : {}),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: { "@type": "Organization", name: article.authorName },
    publisher: { "@type": "Organization", name: article.siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
  };
}
