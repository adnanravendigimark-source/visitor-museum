import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MuseumsGrid from "@/components/MuseumsGrid";
import TrustHighlights from "@/components/TrustHighlights";
import BlogSection from "@/components/BlogSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { getHomepageContent } from "@/lib/homepage";
import { resolveRobots, resolveCanonical, resolveOg, stripHtml } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MuseumsGrid />
        <TrustHighlights />
        <BlogSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
