import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
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

                <div
                  className="rich-content text-[#54595F] leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </article>

              {/* Right Column: Recent Posts Sidebar (1/3 width) */}
              <aside className="lg:col-span-4 rounded-xl border border-gray-100 bg-[#F9F9F9] p-6 sm:p-7 shadow-sm">
                <h5 className="text-lg font-bold text-[#2A302F] mb-4 pb-2 border-b border-gray-200">
                  Recent Posts
                </h5>
                <ul className="space-y-3.5 text-sm">
                  {recentPosts.map((p) => (
                    <li key={p.slug} className="border-b border-gray-200/60 pb-3 last:border-0 last:pb-0">
                      <Link
                        href={`/${p.slug}`}
                        className="font-medium text-[#2A302F] hover:text-[#2D903A] transition-colors leading-snug block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
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

  // If neither a museum nor a post is found, return 404
  notFound();
}
