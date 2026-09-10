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

// No explicit `dynamic` export needed: this page reads the `searchParams`
// prop (the `?q=` search box), which Next already treats as a per-request
// dynamic API on its own — forcing the whole page dynamic via the export
// on top of that bought nothing. Without a search query it still benefits
// from being cacheable.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSeoSettings();
  const og = resolveOg(
    { ogTitle: settings.ogTitle, ogDescription: settings.ogDescription, ogImage: settings.ogImage },
    { title: settings.metaTitle, description: settings.metaDescription }
  );
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    alternates: { canonical: resolveCanonical("/blog", settings.canonicalUrl) },
    robots: resolveRobots(settings.noIndex, settings.noFollow),
    openGraph: { title: og.title, description: og.description, url: "/blog", type: "website", images: og.image ? [{ url: og.image }] : undefined },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

// Simple, case-insensitive match against title/excerpt/category/content —
// good enough for a blog this size without needing a search index.
function matchesQuery(post: { title: string; excerpt: string; category: string; content: string }, query: string): boolean {
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.excerpt.toLowerCase().includes(q) ||
    post.category.toLowerCase().includes(q) ||
    post.content.toLowerCase().includes(q)
  );
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const [allPosts, settings, { heroImage, heroImageAlt }] = await Promise.all([
    getPosts(),
    getBlogSeoSettings(),
    getHomepageContent(),
  ]);
  const query = (searchParams?.q || "").trim();
  const posts = query ? allPosts.filter((p) => matchesQuery(p, query)) : allPosts;

  return (
    <>
      <Header />
      <main className="font-blog-body min-h-screen bg-stone-50">
        {/* Blog Hero Banner */}
        <section className="relative overflow-hidden bg-[#0B1B2B] text-white">
          <div className="absolute inset-0">
            <SafeImage
              src={heroImage || "/images/hero-louvre.jpg"}
              alt={heroImageAlt || "Museum interior"}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-[#0B1B2B]/85 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 sm:text-left">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-white/60">
              <ol className="flex items-center justify-center gap-1.5 sm:justify-start">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li className="text-white/30">&gt;</li>
                <li className="font-semibold text-white" aria-current="page">
                  Blog
                </li>
              </ol>
            </nav>

            {query ? (
              <>
                <h1 className="font-blog-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Search results for &ldquo;{query}&rdquo;
                </h1>
                <p className="mt-4 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm">
                  {posts.length} {posts.length === 1 ? "guide" : "guides"} found.{" "}
                  <Link href="/blog" className="font-semibold text-white underline">
                    Clear search
                  </Link>
                </p>
              </>
            ) : (
              <>
                <span className="mt-4 inline-block rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E2A03F]">
                  {settings.heroEyebrow}
                </span>

                <h1 className="font-blog-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {settings.heroHeading}
                </h1>

                <p className="mt-4 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm">
                  {settings.heroSubheading}
                </p>
              </>
            )}
          </div>
        </section>

        {/* Main Content Area */}
        <BlogIndexContainer
          posts={posts}
          emptyStateText={query ? "No guides matched your search." : settings.emptyStateText}
          ctaHeading="Ready to Plan Your Museum Visit?"
          ctaBody="Compare skip-the-line tickets and guided tours in one place."
          ctaButtonText={settings.ctaButtonText}
          ctaButtonHref={settings.ctaButtonHref}
        />
      </main>
      <Footer />
    </>
  );
}
