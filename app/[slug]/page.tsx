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
import { getMuseumBySlug, getToursByMuseum, getFaqsByMuseum } from "@/lib/museums";
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

export const dynamic = "force-dynamic";

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
    const [{ header }, tours, faqs] = await Promise.all([
      getHomepageContent(),
      getToursByMuseum(museum.id),
      getFaqsByMuseum(museum.id),
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
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: museum.name, path: `/${museum.slug}` }]} />
          <MuseumHero museum={museum} />
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

    return (
      <>
        <Header />
        <main className="bg-white py-10 sm:py-16">
          <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
                { name: post.title, path: `/${post.slug}` },
              ]}
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column: Article Content (2/3 width) */}
              <article className="lg:col-span-8">
                <header className="mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#2A302F] leading-tight">
                    {post.title}
                  </h1>
                </header>

                {post.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 mb-8">
                    <SafeImage
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      priority
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}

                {post.quickAnswer && <QuickAnswer>{post.quickAnswer}</QuickAnswer>}

                <BlogPostBody
                  content={contentHtml}
                  recommendedTourId={post.recommendedTourId}
                  showRecommendedTour={!!post.recommendedTourAfterBlock && !!post.recommendedTourId}
                />

                <div className="mt-10">
                  <CtaBanner
                    heading={post.ctaHeading}
                    subtext={post.ctaBody}
                    buttonText={post.ctaButtonText}
                    buttonHref={post.ctaButtonHref}
                  />
                </div>
              </article>

              {/* Right Column: Sidebar (1/3 width) — search, table of
                  contents for this article, popular guides, and the
                  tickets promo card */}
              <div className="lg:col-span-4">
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
