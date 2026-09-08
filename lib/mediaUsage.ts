import { getHomepageContent } from "./homepage";
import { getMuseums, getToursRawByMuseum, getFaqsByMuseum } from "./museums";
import { getPosts } from "./posts";
import { getAboutPage } from "./about";
import { getContactPage } from "./contact";
import { getPrivacyPolicy } from "./legal";
import { getBlogSeoSettings } from "./settings";

export type MediaUsageMap = Record<string, string[]>;

function collectUrls(value: unknown, into: Set<string>) {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) into.add(value);
    const imgTagRe = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = imgTagRe.exec(value))) into.add(m[1]);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, into);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectUrls(v, into);
  }
}

function addUsage(map: MediaUsageMap, url: string, label: string) {
  if (!map[url]) map[url] = [];
  if (!map[url].includes(label)) map[url].push(label);
}

function tagSource(map: MediaUsageMap, source: unknown, label: string) {
  const urls = new Set<string>();
  collectUrls(source, urls);
  urls.forEach((u) => addUsage(map, u, label));
}

export async function getMediaUsageMap(): Promise<MediaUsageMap> {
  const map: MediaUsageMap = {};

  const [homepage, museums, posts, about, contact, legal, blogSeo] = await Promise.all([
    getHomepageContent().catch(() => null),
    getMuseums().catch(() => []),
    getPosts().catch(() => []),
    getAboutPage().catch(() => null),
    getContactPage().catch(() => null),
    getPrivacyPolicy().catch(() => null),
    getBlogSeoSettings().catch(() => null),
  ]);

  if (homepage) tagSource(map, homepage, "Homepage");

  for (const m of museums) {
    tagSource(map, m, `Museum: "${m.name}"`);
    const [tours, faqs] = await Promise.all([
      getToursRawByMuseum(m.id).catch(() => []),
      getFaqsByMuseum(m.id).catch(() => []),
    ]);
    for (const t of tours) tagSource(map, t, `Tour: "${t.title}" (${m.name})`);
    for (const f of faqs) tagSource(map, f, `FAQ: "${f.question}" (${m.name})`);
  }

  for (const p of posts) tagSource(map, p, `Blog post: "${p.title}"`);
  if (about) tagSource(map, about, "About page");
  if (contact) tagSource(map, contact, "Contact page");
  if (legal) tagSource(map, legal, "Privacy Policy");
  if (blogSeo) tagSource(map, blogSeo, "Blog SEO settings");

  return map;
}
