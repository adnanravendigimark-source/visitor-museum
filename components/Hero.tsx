import Link from "next/link";
import SafeImage from "./SafeImage";
import MuseumSearchBar from "./MuseumSearchBar";
import { ClassicalMuseumIcon, LocationCircleIcon, TicketTagIcon, ShieldCheckIcon, MapPinIcon } from "./icons";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums, getCountryCityMap } from "@/lib/museums";

export default async function Hero() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);

  const heroImage = content.heroImage || "/images/hero-louvre.jpg";
  const heroBadge = content.heroBadge || "WORLD-CLASS MUSEUMS, UNFORGETTABLE EXPERIENCES";
  const heroHeading = content.heroHeading || "Discover the World's Most Iconic Museums";
  const heroSubheading =
    content.heroSubheading.replace(/<[^>]+>/g, "").trim() ||
    "From timeless masterpieces to fascinating cultural treasures, explore the world's best museums and plan your visit with ease.";
  const features = content.heroFeatures?.length ? content.heroFeatures : [];

  // Prefer Louvre Museum if present, otherwise featured museum or first museum
  const spotlightMuseum =
    museums.find((m) => m.slug.includes("louvre") || m.name.toLowerCase().includes("louvre")) ||
    museums.find((m) => m.featured) ||
    museums[0];
  const countries = getCountryCityMap(museums);
  const searchSuggestions = museums.map((m) => ({
    slug: m.slug,
    name: m.name,
    city: m.city,
    country: m.country,
    cardImage: m.cardImage,
    cardImageAlt: m.cardImageAlt,
  }));

  // Trust badges matching the exact reference design
  const trustBadges = [
    { title: "Top Museums", subtitle: "Worldwide", icon: ClassicalMuseumIcon },
    { title: "Real Visitor", subtitle: "Tips", icon: LocationCircleIcon },
    { title: "Easy Ticket", subtitle: "Booking", icon: TicketTagIcon },
    { title: "Trusted", subtitle: "& Secure", icon: ShieldCheckIcon },
  ];

  return (
    <section className="relative h-screen min-h-[660px] max-h-[1020px] w-full overflow-hidden flex flex-col justify-between">
      {/* Full-bleed panoramic background photo */}
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={heroImage}
          alt={content.heroImageAlt || "Louvre Museum in Paris at sunset with glass pyramid"}
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
        />
        {/* Soft left readability gradient on desktop, top-to-bottom fade on mobile */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/80 via-32% to-transparent to-70% sm:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 via-50% to-white/40 sm:hidden" />
        {/* Subtle ground vignette at bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
      </div>

      {/* Main text & Search bar container (centered vertically) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 pb-4 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28 flex-1 flex flex-col justify-center">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Eyebrow with accent line */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#374151] sm:text-xs">
              {heroBadge}
            </p>
            <div className="mt-1.5 h-[2px] w-12 rounded-full bg-[#9E2B25]" />
          </div>

          {/* Main H1 Heading */}
          <h1 className="mt-2.5 sm:mt-3 font-serif text-3xl font-bold leading-[1.12] tracking-tight text-[#111827] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {heroHeading}
          </h1>

          {/* Subheading */}
          <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-[14.5px] leading-relaxed text-[#4B5563]">
            {heroSubheading}
          </p>

          {/* Embedded Filter / Search Bar */}
          <div className="mt-5 sm:mt-6 w-full max-w-xl lg:max-w-2xl">
            <MuseumSearchBar countries={countries} theme="light" museums={searchSuggestions} />
          </div>
        </div>
      </div>

      {/* Bottom bar with Trust Badges (left) and Spotlight Museum (right) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 sm:pb-5 lg:px-8 lg:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Trust features row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 rounded-xl bg-black/40 p-2.5 backdrop-blur-md border border-white/10 sm:rounded-none sm:bg-transparent sm:p-0 sm:border-0 sm:backdrop-blur-none">
            {trustBadges.map((badge, idx) => {
              const IconComponent = badge.icon;
              return (
                <div key={`${badge.title}-${idx}`} className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-white shrink-0 drop-shadow-sm">
                      <IconComponent className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-sm">
                        {badge.title}
                      </span>
                      {badge.subtitle && (
                        <span className="text-[10px] sm:text-[11px] font-medium text-gray-200 drop-shadow-sm">
                          {badge.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  {idx < trustBadges.length - 1 && (
                    <span className="hidden h-5 w-px bg-white/30 sm:inline-block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Featured Museum Pill */}
          {spotlightMuseum && (
            <div className="flex justify-end sm:shrink-0">
              <Link
                href={`/${spotlightMuseum.slug}`}
                className="group inline-flex items-center gap-3 rounded-full bg-[#10241D]/90 px-3.5 py-1.5 shadow-2xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-[1.03] hover:bg-[#10241D] sm:px-4 sm:py-2"
              >
                <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full border border-white/30">
                  <SafeImage
                    src={spotlightMuseum.cardImage || heroImage}
                    alt={spotlightMuseum.cardImageAlt || spotlightMuseum.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-[13px] font-bold leading-tight text-white transition-colors">
                    {spotlightMuseum.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-300">
                    <MapPinIcon className="h-3 w-3 text-gray-400 shrink-0" />
                    <span>
                      {spotlightMuseum.city}, {spotlightMuseum.country}
                    </span>
                  </p>
                </div>
                <span className="ml-1 text-sm font-bold text-gray-300 transition-colors group-hover:text-white group-hover:translate-x-0.5">
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
