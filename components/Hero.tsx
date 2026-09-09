import Link from "next/link";
import SafeImage from "./SafeImage";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums } from "@/lib/museums";

// Full-bleed panoramic hero — same structural pattern as the pena-palace /
// amsterdam-boat-tours reference sites: one edge-to-edge photo with a
// readability gradient baked in, sitting directly behind the transparent
// StickyHeader (see Header.tsx). Every piece of copy here still comes from
// the same admin fields as before (Homepage -> Hero): heroBadge, heroHeading,
// heroSubheading, heroImage/heroImageAlt, heroCtaPrimaryText/Href, and the
// heroFeatures trust strip — this only changes the visual layout, not what's
// editable.
//
// Layout note: the text block and the floating museum badge are both
// `absolute inset-0`-anchored layers, not flex children relying on a nested
// `h-full` percentage height inside a `flex-1` sibling. That combination
// (flex-grow on a parent + height:100% on a grandchild) is a classic
// flexbox trap — the flex-grow consumes all the free space before
// `justify-center` ever gets a chance to distribute it, so the text ends up
// pinned to the top instead of vertically centered. Anchoring each layer
// directly to the section's own edges with `inset-0` sidesteps that
// entirely and centers reliably at every viewport size.
export default async function Hero() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);

  const heroImage = content.heroImage || "/images/hero-louvre.jpg";
  const heroBadge = content.heroBadge || "WORLD-CLASS MUSEUMS, UNFORGETTABLE EXPERIENCES";
  const heroHeading = content.heroHeading || "Discover the World's Most Iconic Museums";
  const heroSubheading =
    content.heroSubheading.replace(/<[^>]+>/g, "").trim() ||
    "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.";
  const ctaText = content.heroCtaPrimaryText || "Explore Museums";
  const ctaHref = content.heroCtaPrimaryHref || "#museums";
  const features = content.heroFeatures?.length ? content.heroFeatures : [];

  // Floating "featured museum" badge over the photo — whichever museum is
  // marked "Featured" (first, by sort order) in the Museums admin, never a
  // fixed museum name/link, so it stays correct as museums are added,
  // reordered, or unfeatured.
  const spotlightMuseum = museums.find((m) => m.featured) || museums[0];

  return (
    <section className="relative min-h-[600px] w-full overflow-hidden bg-[#FAFAFA] sm:min-h-[640px] lg:min-h-[720px]">
      {/* Full-bleed panoramic background photo */}
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={heroImage}
          alt={content.heroImageAlt || "Louvre Museum in Paris at sunset with glass pyramid"}
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
        />
        {/* Readability scrim: top-heavy fade on mobile (text sits at the top
            of a single stacked column), left-heavy fade on desktop (text
            sits in a left column, photo dominant on the right). Kept
            noticeably more opaque than a typical hero gradient, and further
            out (58-62% of the width/height) than the text column's own
            max-width, so the headline/subheading/CTA/trust-strip always sit
            on a solid enough backing to stay legible over a busy photo —
            not just faintly tinted. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] from-10% via-[#FAFAFA]/95 via-62% to-[#FAFAFA]/45 sm:bg-gradient-to-r sm:from-[#FAFAFA] sm:from-5% sm:via-[#FAFAFA]/95 sm:via-58% sm:to-[#FAFAFA]/10" />
      </div>

      {/* Text content — an absolutely-positioned layer anchored to all 4
          edges of the section, so `justify-center` reliably centers it
          vertically regardless of how tall the section ends up being. */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
          <div className="max-w-lg lg:max-w-xl">
            {/* Eyebrow */}
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E2B25] sm:text-xs">
              {heroBadge}
            </p>

            {/* H1 */}
            <h1 className="mt-3.5 font-serif text-3xl font-bold leading-[1.14] tracking-tight text-[#184E3A] sm:text-4xl md:text-5xl lg:text-[3.15rem]">
              {heroHeading}
            </h1>

            {/* Accent line */}
            <div className="mb-5 mt-3.5 h-[2.5px] w-12 rounded-full bg-[#9E2B25]" />

            {/* Subheading */}
            <p className="max-w-md text-sm leading-relaxed text-[#55605E] sm:text-base">
              {heroSubheading}
            </p>

            {/* CTA */}
            <div className="mt-7 flex items-center">
              <Link
                href={ctaHref}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#184E3A] px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#123b2c] hover:shadow-lg"
              >
                <span>{ctaText}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Trust points row — every item comes from the admin's Hero
                "Feature strip" field (content.heroFeatures); nothing here is
                a fixed set of claims baked into the page. */}
            {features.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#54595F] sm:gap-x-7">
                {features.map((feature, i) => (
                  <div key={`${feature.title}-${i}`} className="flex items-center gap-x-6 sm:gap-x-7">
                    <div className="flex items-center gap-2">
                      <span className="text-[#184E3A]">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span title={feature.subtitle || undefined}>{feature.title}</span>
                    </div>
                    {i < features.length - 1 && (
                      <span className="hidden h-3.5 w-px bg-gray-300 sm:inline-block" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating "featured museum" card over the photo, bottom-right at
          every breakpoint (its own absolute layer, independent of the text
          content's centering above). */}
      {spotlightMuseum && (
        <Link
          href={`/${spotlightMuseum.slug}`}
          className="group absolute bottom-5 right-4 z-10 flex items-center gap-3 rounded-2xl border border-white bg-white/95 px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:bg-white sm:bottom-8 sm:right-8 sm:gap-3.5 sm:px-4 lg:bottom-12 lg:right-12"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2EFE7] text-[#184E3A]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-bold leading-tight text-[#182220] transition-colors group-hover:text-[#184E3A]">
              {spotlightMuseum.name}
            </p>
            <p className="text-[10px] font-medium text-gray-500">
              {spotlightMuseum.city}, {spotlightMuseum.country}
            </p>
          </div>
          <span className="ml-1 text-xs font-bold text-gray-400 transition-colors group-hover:text-[#184E3A]">
            ›
          </span>
        </Link>
      )}
    </section>
  );
}
