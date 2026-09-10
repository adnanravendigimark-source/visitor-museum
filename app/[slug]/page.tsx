import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuickAnswer from "@/components/QuickAnswer";
import BlogPostBody from "@/components/BlogPostBody";
import BlogSidebar from "@/components/BlogSidebar";
import MuseumHero from "@/components/MuseumHero";
import MuseumTourGrid from "@/components/MuseumTourGrid";
import MuseumHighlights from "@/components/MuseumHighlights";
import MuseumPracticalInfo from "@/components/MuseumPracticalInfo";
import MuseumPriceComparison from "@/components/MuseumPriceComparison";
import NearbyAttractions from "@/components/NearbyAttractions";
import MuseumFaqSection from "@/components/MuseumFaqSection";
import CtaBanner from "@/components/CtaBanner";
import SafeImage from "@/components/SafeImage";
import { CalendarIcon, ClockPayIcon, TicketIcon } from "@/components/icons";
import { getMuseumBySlug, getToursByMuseum } from "@/lib/museums";
import { getPost, getPosts } from "@/lib/posts";
import { extractTableOfContents } from "@/lib/tableOfContents";
import { getRedirectTarget } from "@/lib/redirects";
import { getHomepageContent } from "@/lib/homepage";
import {
  resolveRobots,
  resolveCanonical,
  resolveOg,
  resolveAbsoluteUrl,
  stripHtml,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Statically rendered per slug and cached (new slugs render on first visit,
// then get served from cache — Next's standard dynamicParams behavior for
// a segment with no generateStaticParams). Invalidated on demand by
// revalidatePath in the museum/post save routes. See the comment on
// app/layout.tsx's removed force-dynamic export.

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const museum = await getMuseumBySlug(params.slug);
  if (museum) {
    const og = resolveOg(
      { ogTitle: museum.ogTitle, ogDescription: museum.ogDescription, ogImage: museum.ogImage },
      { title: museum.metaTitle, description: museum.metaDescription, image: museum.heroImage }
    );

    return {
      title: museum.metaTitle,
      description: museum.metaDescription,
      alternates: { canonical: resolveCanonical(`/${museum.slug}`, museum.canonicalUrl) },
      robots: resolveRobots(museum.noIndex, museum.noFollow),
      openGraph: {
        title: og.title,
        description: og.description,
        url: `/${museum.slug}`,
        images: og.image ? [{ url: og.image, alt: museum.heroImageAlt }] : undefined,
      },
      twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
    };
  }

  const post = await getPost(params.slug);
  if (post) {
    const og = resolveOg(
      { ogTitle: post.ogTitle, ogDescription: post.ogDescription, ogImage: post.ogImage },
      { title: post.metaTitle || post.title, description: post.metaDescription || post.excerpt, image: post.image }
    );

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      alternates: { canonical: resolveCanonical(`/${post.slug}`, post.canonicalUrl) },
      robots: resolveRobots(post.noIndex, post.noFollow),
      openGraph: {
        title: og.title,
        description: og.description,
        url: `/${post.slug}`,
        images: og.image ? [{ url: og.image, alt: post.imageAlt || post.title }] : undefined,
      },
      twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
    };
  }

  return {};
}

function formatPostDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getAuthorParts(author: string) {
  const [namePart, rolePart] = (author || "").split("/").map((s) => s.trim());
  const name = namePart || "Visit Museums";
  const role = rolePart || "";
  const initials =
    name
      .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VM";
  return { name, role, initials };
}

function currencyCode(symbol: string): string {
  const s = (symbol || "").trim().toUpperCase();
  if (s.startsWith("CHF")) return "CHF";
  if (s === "$" || s === "US$" || s === "USD") return "USD";
  if (s === "£" || s === "GBP") return "GBP";
  return "EUR";
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  // 1. Check if slug is a Museum
  const museum = await getMuseumBySlug(params.slug);

  if (museum) {
    // faqs is intentionally not fetched here — MuseumFaqSection fetches it
    // itself, and thanks to getFaqsByMuseum's cache() wrapper that's a free
    // cache hit rather than a second query if anything else on this page
    // ever needs it too.
    const [{ header }, tours] = await Promise.all([
      getHomepageContent(),
      getToursByMuseum(museum.id),
    ]);
    const bookNowText = header.bookNowText || "Book Now";

    const touristAttractionJsonLd = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: museum.name,
      url: `${SITE_URL}/${museum.slug}`,
      description: stripHtml(museum.metaDescription || museum.heroSubheading || ""),
      image: resolveAbsoluteUrl(museum.heroImage),
      address: {
        "@type": "PostalAddress",
        addressLocality: museum.city,
        addressCountry: museum.country,
      },
      ...(Number.isFinite(museum.lat) && Number.isFinite(museum.lng)
        ? { geo: { "@type": "GeoCoordinates", latitude: museum.lat, longitude: museum.lng } }
        : {}),
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: museum.name, item: `${SITE_URL}/${museum.slug}` },
      ],
    };

    // Note: FAQPage JSON-LD is intentionally NOT built here — MuseumFaqSection
    // already emits its own FAQPage script alongside the FAQ accordion it
    // renders, so building a second one here would ship two duplicate
    // FAQPage structured-data blocks on the same page.

    const productJsonLd = tours
      .filter((t) => t.featured)
      .map((t) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: t.title,
        description: stripHtml(t.description),
        image: resolveAbsoluteUrl(t.image),
        aggregateRating: { "@type": "AggregateRating", ratingValue: t.rating, reviewCount: t.reviews },
        offers: {
          "@type": "Offer",
          priceCurrency: currencyCode(museum.currencySymbol),
          price: t.price,
          availability: "https://schema.org/InStock",
          url: t.href,
        },
      }));

    return (
      <>
        <Header />
        <main>
          <MuseumHero
            museum={museum}
            breadcrumbItems={[{ name: "Home", path: "/" }, { name: museum.name, path: `/${museum.slug}` }]}
          />
          <MuseumTourGrid museum={museum} bookNowText={bookNowText} />
          <MuseumHighlights museum={museum} />
          <MuseumPracticalInfo museum={museum} />
          <MuseumPriceComparison museum={museum} />
          <NearbyAttractions museum={museum} />
          <MuseumFaqSection museum={museum} />
          <CtaBanner
            heading={museum.ctaHeading}
            subtext={museum.ctaSubtext}
            buttonText={museum.ctaButtonText}
            buttonHref="#tickets"
          />
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        {productJsonLd.map((data, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
        ))}
      </>
    );
  }

  // 2. Check if slug is a Blog Post
  const post = await getPost(params.slug);
  if (post) {
    const allPosts = await getPosts();
    const recentPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 6);
    // Headings in the article body get an id injected so the sidebar's
    // Table of Contents can jump-link to them.
    const { toc, html: contentHtml } = extractTableOfContents(post.content);

    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || post.metaDescription,
      image: resolveAbsoluteUrl(post.image),
      datePublished: post.date,
      dateModified: post.updatedAt || post.date,
      author: {
        "@type": "Organization",
        name: post.author || "Visit Museums",
      },
      publisher: {
        "@type": "Organization",
        name: "Visit Museums",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/visit-museums-logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${post.slug}`,
      },
    };

    const author = getAuthorParts(post.author);

    return (
      <>
        <Header />
        <main className="font-blog-body min-h-screen bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
                { name: post.title, path: `/${post.slug}` },
              ]}
            />

            {/* Post Header */}
            <div className="mt-5">
              {post.category && (
                <span className="inline-block rounded-md bg-[#FAF8F5] border border-[#ECE8DE] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#B85D3E]">
                  {post.category}
                </span>
              )}

              <h1 className="font-blog-display mt-3.5 text-3xl font-bold leading-tight text-[#112338] sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-[#556476] sm:text-base">
                  {post.excerpt}
                </p>
              )}

              {/* Author Meta Row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#556476]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-[#B85D3E]" />
                  {formatPostDate(post.date)}
                </span>
                {post.readTime && (
                  <span className="inline-flex items-center gap-1.5">
                    <ClockPayIcon className="h-4 w-4 text-[#B85D3E]" />
                    {post.readTime}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#112338] text-[10px] font-bold text-white">
                    {author.initials}
                  </span>
                  <span className="font-semibold text-[#112338]">By {author.name}</span>
                </span>
              </div>

              {/* Hero Cover Image */}
              {post.image && (
                <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E8ECEF] bg-gray-100 shadow-sm sm:aspect-[21/10]">
                  <SafeImage
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    priority
                    sizes="(min-width: 1152px) 1152px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* 2-Column Main Content & Sidebar */}
            <div className="mt-10 pb-20 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
              {/* Left Column: Article Body */}
              <div>
                {post.quickAnswer && <QuickAnswer>{post.quickAnswer}</QuickAnswer>}

                <BlogPostBody
                  content={contentHtml}
                  recommendedTourId={post.recommendedTourId}
                  showRecommendedTour={!!post.recommendedTourAfterBlock && !!post.recommendedTourId}
                />

                {/* Bottom Article CTA Card */}
                <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#E8ECEF] bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF8F5] p-6 text-center shadow-sm sm:flex-row sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B85D3E]/10 text-[#B85D3E]">
                      <TicketIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-blog-display text-base font-bold text-[#112338]">
                        {post.ctaHeading}
                      </p>
                      <p className="mt-0.5 text-xs text-[#556476]">
                        {post.ctaBody}
                      </p>
                    </div>
                  </div>

                  <a
                    href={post.ctaButtonHref}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0B1B2B] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:scale-[1.02]"
                  >
                    {post.ctaButtonText}
                  </a>
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="mt-12 lg:mt-0">
                <BlogSidebar
                  slug={post.slug}
                  popularPosts={recentPosts}
                  toc={toc}
                />
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      </>
    );
  }

  // 3. Neither a museum nor a post — but this might be an old post slug
  // that was renamed. The Advanced SEO tab on every post explicitly tells
  // admins that renaming a slug "automatically 301-redirects the old
  // address here — no broken links": recordSlugRename() (called from the
  // posts PUT route) does write that row, but until now nothing ever read
  // it back, so old links and search rankings actually broke on every
  // rename. Only checked here, on the 404 path, so normal page loads never
  // pay for the extra lookup.
  const redirectTarget = await getRedirectTarget(params.slug);
  if (redirectTarget) {
    permanentRedirect(`/${redirectTarget}`);
  }

  // If neither a museum nor a post is found, return 404
  notFound();
}
