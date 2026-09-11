import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MuseumsGrid from "@/components/MuseumsGrid";
import MuseumsPageSearch from "@/components/MuseumsPageSearch";
import { getMuseums, getCountryCityMap } from "@/lib/museums";
import { SITE_URL } from "@/lib/site";

// Statically rendered and cached, same as the homepage — invalidated on
// demand by revalidatePath("/museums") wherever a museum is saved (see the
// Museums admin API routes), not re-rendered per request.

export const metadata: Metadata = {
  title: "All Museums & Attractions | Visit Museums",
  description:
    "Browse every museum, gallery, and landmark covered by Visit Museums — filter by country or city to find skip-the-line tickets and guided tours.",
  alternates: { canonical: `${SITE_URL}/museums` },
};

export default async function MuseumsPage() {
  const museums = await getMuseums();
  const countries = getCountryCityMap(museums);
  const countryCount = countries.length;
  const cityCount = new Set(museums.map((m) => m.city).filter(Boolean)).size;

  // Same minimal shape as Hero.tsx's search suggestions — feeds the filter
  // bar's "jump straight to a museum" type-ahead dropdown.
  const searchSuggestions = museums.map((m) => ({
    slug: m.slug,
    name: m.name,
    city: m.city,
    country: m.country,
    cardImage: m.cardImage,
    cardImageAlt: m.cardImageAlt,
  }));

  const stats = [
    { label: museums.length === 1 ? "Museum" : "Museums", value: museums.length },
    { label: countryCount === 1 ? "Country" : "Countries", value: countryCount },
    { label: cityCount === 1 ? "City" : "Cities", value: cityCount },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-[#F4F7F5] to-[#FAFAFA] py-14 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#7A7A7A]">
              <ol className="flex items-center gap-1.5">
                <li>
                  <a href="/" className="hover:text-[#184E3A]">
                    Home
                  </a>
                </li>
                <li className="text-gray-300">/</li>
                <li className="font-semibold text-[#2A302F]" aria-current="page">
                  All Museums &amp; Attractions
                </li>
              </ol>
            </nav>

            <div className="mt-5 flex flex-col items-start lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="max-w-2xl">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#184E3A]">
                    EXPLORE EVERYTHING WE COVER
                  </span>
                  <span className="mt-1.5 h-[3px] w-8 rounded-full bg-[#184E3A]" />
                </div>
                <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#1F2429] sm:text-4xl lg:text-[2.6rem]">
                  All Museums &amp; Attractions
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#556476] sm:text-base">
                  Every museum, gallery, and landmark we cover, in one place. Filter by country or
                  city, or search by name to find skip-the-line tickets and guided tours.
                </p>
              </div>

              {/* Quick stats — purely descriptive, computed live from the
                  same museum list the grid below renders, so they can never
                  drift out of sync with what's actually published. */}
              <div className="mt-7 flex shrink-0 items-stretch gap-3 lg:mt-0">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex flex-col items-start rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-gray-100 ${
                      i === 0 ? "" : "hidden sm:flex"
                    }`}
                  >
                    <span className="font-serif text-2xl font-bold text-[#184E3A]">{s.value}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7A7A7A]">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 max-w-3xl">
              <MuseumsPageSearch countries={countries} museums={searchSuggestions} />
            </div>
          </div>
        </section>

        <MuseumsGrid initialMuseums={museums} showHeader={false} />
      </main>
      <Footer />
    </>
  );
}
