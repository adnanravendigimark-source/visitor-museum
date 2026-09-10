import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MuseumsGrid from "@/components/MuseumsGrid";
import CulturalJourneyBanner from "@/components/CulturalJourneyBanner";
import BlogSection from "@/components/BlogSection";
import SiteFaqSection from "@/components/SiteFaqSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums } from "@/lib/museums";
import { resolveRobots, resolveCanonical, resolveOg, stripHtml } from "@/lib/seo";

// Statically rendered and cached — invalidated on demand by revalidatePath
// in the Homepage/Museums admin save routes, not re-rendered per request.
// See the comment on app/layout.tsx's removed force-dynamic export.

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepageContent();
  const og = resolveOg(
    { ogTitle: homepage.ogTitle, ogDescription: homepage.ogDescription, ogImage: homepage.ogImage },
    { title: homepage.heroHeading, description: stripHtml(homepage.heroSubheading), image: homepage.heroImage }
  );
  return {
    ...(homepage.metaTitle.trim() ? { title: homepage.metaTitle } : {}),
    ...(homepage.metaDescription.trim() ? { description: homepage.metaDescription } : {}),
    alternates: { canonical: resolveCanonical("/", homepage.canonicalUrl) },
    robots: resolveRobots(homepage.noIndex, homepage.noFollow),
    openGraph: { title: og.title, description: og.description, url: "/", images: og.image ? [{ url: og.image }] : undefined },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

export default async function HomePage() {
  const [homepage, museums] = await Promise.all([
    getHomepageContent(),
    getMuseums(),
  ]);

  // Which museums show on the homepage grid, and in what order, is driven
  // entirely by each museum's own admin fields (Museums -> Details ->
  // "Featured" checkbox, and the Museums list's drag/reorder) — never a
  // fixed list of slugs baked into the page. getMuseums() already returns
  // museums sorted by sort_order, so this only needs to filter.
  const featuredMuseums = museums.filter((m) => m.featured);
  const homepageMuseums = featuredMuseums.length ? featuredMuseums : museums.slice(0, 6);

  const gridSection = homepage.sections.grid;

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MuseumsGrid
          initialMuseums={homepageMuseums}
          eyebrow={gridSection.eyebrow}
          heading={gridSection.heading}
          subheading={gridSection.subheading}
        />
        <CulturalJourneyBanner />
        <BlogSection />
        <SiteFaqSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
