import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import MuseumsPageSearch from "@/components/MuseumsPageSearch";
import MuseumsCatalogExplorer from "@/components/MuseumsCatalogExplorer";
import { ClassicalMuseumIcon, TicketTagIcon, ShieldCheckIcon, HeadsetIcon } from "@/components/icons";
import { getMuseums, getCountryCityMap } from "@/lib/museums";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Museums & Attractions | Visit Museums",
  description:
    "Discover the world's most iconic museums, galleries, and cultural attractions. Explore by country or city, search for your favorite museum, and find the perfect experience for your next trip.",
  alternates: { canonical: `${SITE_URL}/museums` },
};

export default async function MuseumsPage() {
  const museums = await getMuseums();
  const countries = getCountryCityMap(museums);

  const searchSuggestions = museums.map((m) => ({
    slug: m.slug,
    name: m.name,
    city: m.city,
    country: m.country,
    cardImage: m.cardImage,
    cardImageAlt: m.cardImageAlt,
  }));

  return (
    <>
      <Header />
      <main>
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden bg-[#FAFAFA] pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
          {/* Background panoramic photo with soft readability scrim */}
          <div className="absolute inset-0 z-0">
            <SafeImage
              src="/images/hero-louvre.jpg"
              alt="Louvre Museum in Paris at sunset"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[70%_center] lg:object-center"
            />
            {/* Scrim: gentle warm white gradient on left, transparent on right */}
            <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/85 via-42% to-transparent to-85% sm:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 via-55% to-white/60 sm:hidden" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-xs font-semibold text-gray-500">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-[#184E3A] transition">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="font-bold text-[#184E3A]" aria-current="page">
                  Museums
                </li>
              </ol>
            </nav>

            <div className="mt-5 flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-12">
              <div className="max-w-2xl">
                {/* Eyebrow */}
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#374151] sm:text-xs">
                  WORLD-CLASS MUSEUMS • TIMELESS ART • UNFORGETTABLE EXPERIENCES
                </p>

                {/* H1 Title */}
                <h1 className="mt-3 font-serif text-3xl font-bold leading-[1.12] tracking-tight text-[#111827] sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                  All Museums &amp; Attractions
                </h1>

                {/* Subheading */}
                <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-[#4B5563] sm:text-[15px]">
                  Discover the world&apos;s most iconic museums, galleries, and cultural attractions.
                  Explore by country or city, search for your favorite museum, and find the perfect
                  experience for your next trip.
                </p>

                {/* Embedded Filter & Search Bar */}
                <div className="mt-7 w-full max-w-xl lg:max-w-2xl">
                  <MuseumsPageSearch countries={countries} museums={searchSuggestions} />
                </div>
              </div>

              {/* Artistic Cursive Script Badge (Top Right) */}
              <div className="mt-6 hidden lg:flex flex-col items-end rotate-[-3deg] select-none pointer-events-none opacity-90 pr-6">
                <span className="font-serif italic text-4xl font-bold tracking-tight text-[#2A302F]/80 drop-shadow-xs">
                  Art
                </span>
                <span className="font-serif italic text-3xl font-bold tracking-tight text-[#9E2B25]/85 -mt-2 drop-shadow-xs">
                  Culture
                </span>
                <span className="font-serif italic text-4xl font-bold tracking-tight text-[#184E3A]/90 -mt-2 drop-shadow-xs">
                  History
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4-ITEM TRUST STRIP ================= */}
        <section className="border-y border-gray-100 bg-white py-4 sm:py-5 shadow-xs">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF5ED] text-[#184E3A]">
                  <ClassicalMuseumIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-bold text-[#1F2429]">
                    {museums.length}+ Museums
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    World-famous collections
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF5ED] text-[#184E3A]">
                  <TicketTagIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-bold text-[#1F2429]">
                    Fast &amp; Easy Booking
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    Skip the line, save time
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF5ED] text-[#184E3A]">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-bold text-[#1F2429]">
                    Trusted &amp; Secure
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    Your booking is safe
                  </span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF5ED] text-[#184E3A]">
                  <HeadsetIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-bold text-[#1F2429]">
                    24/7 Support
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    We&apos;re here to help
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATALOG EXPLORER (SIDEBAR + GRID) ================= */}
        <MuseumsCatalogExplorer initialMuseums={museums} countries={countries} />

        {/* ================= BOTTOM CTA BANNER ================= */}
        <section className="bg-[#102922] py-8 sm:py-10 text-white">
          <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                <ClassicalMuseumIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-white sm:text-xl">
                  Plan Your Museum Adventure
                </h3>
                <p className="text-xs text-gray-300">
                  Discover, explore, and experience the world&apos;s greatest museums.
                </p>
              </div>
            </div>

            <Link
              href="/#museums"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#102922]"
            >
              <span>Explore All Museums</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
