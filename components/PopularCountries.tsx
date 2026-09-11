import Link from "next/link";
import SafeImage from "./SafeImage";
import { getMuseums, getPopularCountries, getCountryStats } from "@/lib/museums";
import { getHomepageContent } from "@/lib/homepage";

// Homepage "Popular Countries" section — a destination-style grid, one card
// per country. Two modes, both driven by Homepage admin -> Popular
// Countries:
//  - Curated (admin has added countries there): shows exactly those
//    countries, in that order, with each card's photo/caption using the
//    admin's override if set, falling back to a computed default otherwise.
//  - Automatic (no countries added yet): falls back to the top 6 countries
//    by museum count, fully derived from the real catalog — see
//    getPopularCountries in lib/museums.ts.
// Either way, every card links to /museums?country=..., which MuseumsGrid
// already reads and pre-filters on mount (same query param the Hero/header
// search bars use) — this is a "browse by destination" shortcut into the
// existing filtered listing page, not a new page or dataset of its own.
export default async function PopularCountries() {
  const [museums, homepage] = await Promise.all([getMuseums(), getHomepageContent()]);
  const section = homepage.sections.popularCountries;

  if (!section.enabled) return null;

  const curated = section.items.length > 0;

  const cards = curated
    ? section.items
        .filter((item) => item.country)
        .map((item) => {
          const stats = getCountryStats(museums, item.country);
          if (!stats) return null;
          return {
            country: item.country,
            museumCount: stats.museumCount,
            cityCount: stats.cityCount,
            image: item.image || stats.image,
            imageAlt: item.imageAlt || stats.imageAlt,
            caption: item.tagline || "",
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
    : getPopularCountries(museums, 6).map((c) => ({ ...c, caption: "" }));

  // Fewer than 2 countries in fully-automatic mode wouldn't say anything
  // useful as a grid — skip the section entirely rather than show one
  // lonely card. A curated list is always shown as-is, even with just one
  // country, since the admin picked it deliberately.
  if (cards.length === 0 || (!curated && cards.length < 2)) return null;

  return (
    <section className="bg-[#FAFAFA] py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
          <div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#184E3A]">
                {section.eyebrow}
              </span>
              <span className="mt-1.5 h-[3px] w-8 rounded-full bg-[#184E3A]" />
            </div>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#1F2429] sm:text-3xl lg:text-4xl">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#556476] sm:text-sm">
                {section.subheading}
              </p>
            )}
          </div>
          <Link
            href={section.viewAllHref || "/museums"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#184E3A]/25 px-4 py-2 text-xs font-bold text-[#184E3A] transition hover:bg-[#184E3A] hover:text-white"
          >
            {section.viewAllText || "View All Museums"}
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
          {cards.map((c) => (
            <Link
              key={c.country}
              href={`/museums?country=${encodeURIComponent(c.country)}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <SafeImage
                src={c.image}
                alt={c.imageAlt}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="relative z-10 p-3.5 sm:p-4">
                <p className="font-serif text-base font-bold leading-tight text-white sm:text-lg">
                  {c.country}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-white/80">
                  {c.caption ||
                    `${c.museumCount} ${c.museumCount === 1 ? "museum" : "museums"}${
                      c.cityCount > 1 ? ` · ${c.cityCount} cities` : ""
                    }`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
