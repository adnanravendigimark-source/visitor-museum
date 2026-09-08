import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import MuseumHero from "@/components/MuseumHero";
import MuseumTourGrid from "@/components/MuseumTourGrid";
import MuseumHighlights from "@/components/MuseumHighlights";
import MuseumPracticalInfo from "@/components/MuseumPracticalInfo";
import MuseumPriceComparison from "@/components/MuseumPriceComparison";
import MuseumFaqSection from "@/components/MuseumFaqSection";
import NearbyAttractions from "@/components/NearbyAttractions";
import CtaBanner from "@/components/CtaBanner";
import { getMuseumBySlug, getToursByMuseum, getFaqsByMuseum } from "@/lib/museums";
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
  if (!museum) return {};

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

// Best-effort ISO 4217 currency code from the admin-editable display symbol
// (e.g. "€" -> EUR, "CHF " -> CHF) — schema.org's Offer.priceCurrency needs
// a real currency code, not the symbol shown to visitors. Falls back to EUR
// (this project's most common currency) for any symbol not recognized here
// rather than emitting an invalid/omitted priceCurrency.
function currencyCode(symbol: string): string {
  const s = (symbol || "").trim().toUpperCase();
  if (s.startsWith("CHF")) return "CHF";
  if (s === "$" || s === "US$" || s === "USD") return "USD";
  if (s === "£" || s === "GBP") return "GBP";
  return "EUR";
}

export default async function MuseumPage({ params }: { params: { slug: string } }) {
  const museum = await getMuseumBySlug(params.slug);
  if (!museum) notFound();

  const [{ header }, tours, faqs] = await Promise.all([
    getHomepageContent(),
    getToursByMuseum(museum.id),
    getFaqsByMuseum(museum.id),
  ]);
  const bookNowText = header.bookNowText || "Book Tickets";

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

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: stripHtml(f.question),
            acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answer) },
          })),
        }
      : null;

  const productJsonLd = tours
    .filter((t) => t.featured)
    .map((t) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: t.title,
      description: stripHtml(t.description),
      // Google Search Console's Merchant listings check flags Product
      // structured data missing an "image" as a critical error.
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
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      {productJsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
    </>
  );
}
