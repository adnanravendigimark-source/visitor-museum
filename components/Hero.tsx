import Link from "next/link";
import SafeImage from "./SafeImage";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums } from "@/lib/museums";

export default async function Hero() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);

  const heroImage = content.heroImage || "/images/hero-louvre.jpg";
  const heroBadge =
    content.heroBadge || "WORLD-CLASS MUSEUMS, UNFORGETTABLE EXPERIENCES";
  const heroHeading =
    content.heroHeading || "Discover the World's Most Iconic Museums";
  const heroSubheading =
    content.heroSubheading.replace(/<[^>]+>/g, "").trim() ||
    "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.";
  const ctaText = content.heroCtaPrimaryText || "Explore Museums";
  const ctaHref = content.heroCtaPrimaryHref || "#museums";
  const features = content.heroFeatures?.length ? content.heroFeatures : [];

  // Floating "featured museum" badge on the hero image — the museum shown
  // and linked here is whichever one is marked "Featured" (first, by sort
  // order) in the Museums admin, never a fixed museum name/link, so it
  // stays correct as museums are added, reordered, or unfeatured.
  const spotlightMuseum = museums.find((m) => m.featured) || museums[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFA]">
      {/* Right Side Background Image on Desktop */}
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[46%] xl:w-[48%] z-0">
        <SafeImage
          src={heroImage}
          alt={content.heroImageAlt || "Louvre Museum in Paris at sunset with glass pyramid"}
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-center"
        />
        {/* Mobile Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/85 to-transparent lg:hidden" />
      </div>

      {/* Sweeping S-Curve SVG Overlay dividing left off-white area and right photo */}
      <div className="pointer-events-none absolute inset-y-0 right-[42%] lg:right-[44%] xl:right-[46%] w-24 sm:w-32 z-[1] hidden lg:block">
        <svg
          className="h-full w-full text-[#FAFAFA]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M0,0 L80,0 C45,30 35,65 100,100 L0,100 Z" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 pr-0 lg:pr-6 max-w-2xl">
            {/* Eyebrow */}
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#184E3A]">
              {heroBadge}
            </span>

            {/* H1 Heading */}
            <h1 className="mt-3.5 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] font-bold text-[#182220] leading-[1.14] tracking-tight">
              {heroHeading}
            </h1>

            {/* Subheading */}
            <p className="mt-4 text-sm sm:text-base text-[#55605E] leading-relaxed max-w-xl">
              {heroSubheading}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex items-center">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-[#184E3A] hover:bg-[#123b2c] text-white px-7 py-3 text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {ctaText}
              </Link>
            </div>

            {/* Trust points row — every item comes from the admin's Hero
                "Feature strip" field (content.heroFeatures); nothing here is
                a fixed set of claims baked into the page. */}
            {features.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-y-3 gap-x-6 sm:gap-x-7 text-xs font-semibold text-[#54595F]">
                {features.map((feature, i) => (
                  <div key={`${feature.title}-${i}`} className="flex items-center gap-x-6 sm:gap-x-7">
                    <div className="flex items-center gap-2">
                      <span className="text-[#184E3A]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span title={feature.subtitle || undefined}>{feature.title}</span>
                    </div>
                    {i < features.length - 1 && (
                      <span className="hidden sm:inline-block w-px h-3.5 bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Floating Badge overlay on image */}
          {spotlightMuseum && (
            <div className="lg:col-span-5 flex justify-end items-end h-full pt-10 sm:pt-16 lg:pt-0">
              <Link
                href={`/${spotlightMuseum.slug}`}
                className="group flex items-center gap-3.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white transition-all duration-300 hover:scale-[1.03] hover:bg-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2EFE7] text-[#184E3A]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold text-[#182220] leading-tight group-hover:text-[#184E3A] transition-colors">
                    {spotlightMuseum.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {spotlightMuseum.city}, {spotlightMuseum.country}
                  </p>
                </div>
                <span className="ml-1 text-gray-400 group-hover:text-[#184E3A] transition-colors text-xs font-bold">
                  ›
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
