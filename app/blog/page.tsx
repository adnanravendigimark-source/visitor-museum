import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import BlogIndexContainer from "@/components/BlogIndexContainer";
import { getPosts } from "@/lib/posts";
import { getBlogSeoSettings } from "@/lib/settings";
import { getHomepageContent } from "@/lib/homepage";
import { resolveRobots, resolveCanonical, resolveOg } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSeoSettings();
  const og = resolveOg(settings, { title: settings.metaTitle, description: settings.metaDescription });
  return {
    title: settings.metaTitle || "Visit Museums Blog | Tickets, Tips & Guides 2026",
    description: settings.metaDescription || "Tips, ticket comparisons and travel guides to help you plan your museum visit.",
    alternates: { canonical: resolveCanonical("/blog", settings.canonicalUrl) },
    robots: resolveRobots(settings.noIndex, settings.noFollow),
    openGraph: { title: og.title, description: og.description, url: "/blog", type: "website", images: og.image ? [{ url: og.image }] : undefined },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

export default async function BlogIndexPage() {
  const [posts, { sections, heroImage, heroImageAlt }] = await Promise.all([getPosts(), getHomepageContent()]);
  const s = sections.blogPage;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF8F5]">
        {/* Blog Hero Banner */}
        <section className="relative overflow-hidden bg-[#0B1B2B] text-white">
          <div className="absolute inset-0">
            <SafeImage
              src={heroImage || "/images/hero-museums.jpg"}
              alt={heroImageAlt || "Museum gallery interior"}
              fill
              priority
              quality={68}
              sizes="100vw"
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-[#0B1B2B]/75 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 text-center sm:text-left">
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#CBD5E1]">
              <ol className="flex items-center justify-center sm:justify-start gap-1.5">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-white/40">&gt;</li>
                <li className="font-semibold text-white" aria-current="page">
                  Blog &amp; Guides
                </li>
              </ol>
            </nav>

            <h1 className="mt-3.5 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {s.heading || "Museum Travel Guides"}
            </h1>

            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3 max-w-xs mx-auto sm:mx-0">
              <span className="h-px flex-1 bg-white/20" />
              <span className="text-[#E2A03F] text-sm">🏛️</span>
              <span className="h-px flex-1 bg-white/20" />
            </div>

            <p className="mt-3.5 max-w-lg text-xs leading-relaxed text-[#CBD5E1] sm:text-sm">
              {s.subheading || "Tips, ticket comparisons and travel guides to help you plan your museum visit."}
            </p>
          </div>
        </section>

        <BlogIndexContainer
          posts={posts}
          emptyStateText={s.emptyStateText}
          ctaHeading={s.ctaHeading || "Ready to plan your museum visit?"}
          ctaBody="Compare skip-the-line tickets and guided tours in one place."
          ctaButtonText={s.ctaButtonText || "Browse Museum Tickets →"}
        />
      </main>
      <Footer />
    </>
  );
}
