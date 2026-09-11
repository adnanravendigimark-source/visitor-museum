import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPosts } from "@/lib/posts";
import { getHomepageContent } from "@/lib/homepage";
import { getPrivacyPolicy } from "@/lib/legal";
import { getBlogSeoSettings } from "@/lib/settings";
import { getAboutPage } from "@/lib/about";
import { getContactPage } from "@/lib/contact";
import { getMuseums } from "@/lib/museums";

// Regenerated on demand (revalidatePath("/sitemap.xml") in the Posts and
// Museums admin save routes) rather than on every single crawl request —
// search engines hit this far more often than a human ever will, so
// force-dynamic here meant a full DB fan-out (7 queries) on every crawler
// hit. A 1-hour revalidate is also set as a safety net in case some
// content change doesn't yet call revalidatePath("/sitemap.xml").
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [homepage, policy, posts, blogSeo, about, contact, museums] = await Promise.all([
    getHomepageContent(),
    getPrivacyPolicy(),
    getPosts(),
    getBlogSeoSettings(),
    getAboutPage(),
    getContactPage(),
    getMuseums(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...(homepage.noIndex || homepage.noFollow
      ? []
      : [{ url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily" as const, priority: 1.0 }]),
    { url: `${SITE_URL}/museums`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    ...(about.noIndex || about.noFollow
      ? []
      : [{ url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 }]),
    ...(contact.noIndex || contact.noFollow
      ? []
      : [{ url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }]),
    ...(blogSeo.noIndex || blogSeo.noFollow
      ? []
      : [{ url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }]),
    ...(policy.noIndex || policy.noFollow
      ? []
      : [{ url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 }]),
  ];

  const museumRoutes: MetadataRoute.Sitemap = museums
    .filter((m) => !m.noIndex && !m.noFollow)
    .map((m) => ({
      url: `${SITE_URL}/${m.slug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => !post.noIndex && !post.noFollow)
    .map((post) => ({
      url: `${SITE_URL}/${post.slug}`,
      lastModified: post.updatedAt || post.date ? new Date(post.updatedAt || post.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...museumRoutes, ...postRoutes];
}
