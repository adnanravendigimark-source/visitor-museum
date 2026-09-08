import MuseumForm from "@/components/admin/MuseumForm";
import type { Museum } from "@/lib/museums";

const blank: Museum = {
  id: "",
  slug: "",
  name: "",
  city: "",
  country: "",
  currencySymbol: "€",
  lat: 0,
  lng: 0,
  sortOrder: 0,
  featured: false,
  cardImage: "",
  cardImageAlt: "",
  cardTagline: "",
  heroBadge: "",
  heroHeading: "",
  heroSubheading: "",
  heroImage: "",
  heroImageAlt: "",
  highlightsEyebrow: "What You'll See",
  highlightsHeading: "",
  highlightsSubheading: "",
  highlights: [],
  aboutHeading: "",
  aboutBody: "",
  toursEyebrow: "Compare & Book Tickets",
  toursHeading: "",
  toursSubheading: "",
  practicalHoursHeading: "Opening Hours",
  practicalHours: [],
  practicalHoursNote: "",
  practicalAddressHeading: "Address",
  practicalAddress: "",
  practicalGettingThere: "",
  practicalBestTimeHeading: "Best Time to Visit",
  practicalBestTimeBody: "",
  priceEyebrow: "Tickets & Tours",
  priceHeading: "",
  priceSubheading: "",
  priceNote: "",
  faqEyebrow: "FAQs",
  faqHeading: "",
  ctaHeading: "",
  ctaSubtext: "",
  ctaButtonText: "Compare Tickets & Tours",
  nearbyHeadingOverride: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  createdAt: "",
  updatedAt: "",
};

export default function NewMuseumPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Add Museum</h1>
      <p className="mt-1 text-sm text-stone-600">
        Fill in the basics and save — you can then add tours, tickets, and FAQs.
      </p>
      <div className="mt-8 max-w-4xl">
        <MuseumForm initial={blank} isNew />
      </div>
    </div>
  );
}
