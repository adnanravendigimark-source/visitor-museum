"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import type { Museum } from "@/lib/museums";

export default function MuseumsGrid({
  initialMuseums,
  eyebrow = "POPULAR MUSEUMS",
  heading = "Explore the World's Best Museums",
  subheading = "",
  showHeader = true,
  viewAllHref,
  viewAllText = "View All Museums",
}: {
  initialMuseums: Museum[];
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  // The homepage's grid section has its own eyebrow/heading/subheading
  // block above the cards (source: Homepage admin -> Museums Grid). The
  // /museums page renders its own banner + filter bar above this component
  // instead, so it passes showHeader={false} to avoid a second, duplicate
  // heading.
  showHeader?: boolean;
  // Set on the homepage only, where the grid is capped to 3 museums (see
  // app/page.tsx) — renders a link to the full /museums page next to the
  // heading so the other museums are still reachable in one click.
  viewAllHref?: string;
  viewAllText?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    function handleSearchEvent(e: Event) {
      const custom = e as CustomEvent<{ query?: string; country?: string; city?: string }>;
      if (custom.detail) {
        setSearchQuery(custom.detail.query || "");
        setCountryFilter(custom.detail.country || "");
        setCityFilter(custom.detail.city || "");
      }
    }

    // Check URL params on mount — lets a search submitted from the Hero
    // search bar or the header's search (both of which navigate to
    // /museums?q=&country=&city=) land here already filtered, and makes a
    // shared/bookmarked filtered URL work the same way.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const country = params.get("country") || "";
      const city = params.get("city") || "";
      if (q || country || city) {
        setSearchQuery(q);
        setCountryFilter(country);
        setCityFilter(city);
      }
    }

    // Live updates while already on the page (e.g. the /museums page's own
    // filter bar) dispatch this instead of a full navigation, so the grid
    // re-filters instantly without a page reload.
    window.addEventListener("museumSearch", handleSearchEvent);
    return () => window.removeEventListener("museumSearch", handleSearchEvent);
  }, []);

  const filtered = useMemo(() => {
    return initialMuseums.filter((m) => {
      const matchQuery =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cardTagline.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCountry = !countryFilter.trim() || m.country.toLowerCase() === countryFilter.toLowerCase();
      const matchCity = !cityFilter.trim() || m.city.toLowerCase() === cityFilter.toLowerCase();

      return matchQuery && matchCountry && matchCity;
    });
  }, [initialMuseums, searchQuery, countryFilter, cityFilter]);

  const locationFilter = [cityFilter, countryFilter].filter(Boolean).join(", ");

  return (
    <section id="museums" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {showHeader && (
          <div className="mb-10 sm:mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#184E3A]">
                  {eyebrow}
                </span>
                <span className="mt-1.5 h-[3px] w-8 rounded-full bg-[#184E3A]" />
              </div>

              <h2 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2429] tracking-tight">
                {heading}
              </h2>
              {subheading && (
                <p className="mt-3 max-w-2xl text-xs sm:text-sm text-[#556476] leading-relaxed">{subheading}</p>
              )}
            </div>

            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#184E3A]/25 px-4 py-2 text-xs font-bold text-[#184E3A] transition hover:bg-[#184E3A] hover:text-white"
              >
                {viewAllText}
                <span>→</span>
              </Link>
            )}
          </div>
        )}

        {/* Results count + active filters — only on the /museums page
            itself (showHeader=false); the homepage's capped-to-3 grid has
            no filter bar of its own, so this would just be noise there. */}
        {!showHeader && (
          <div className="mb-7 flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-medium text-[#7A7A7A]">
              Showing <span className="font-bold text-[#1F2429]">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "museum" : "museums"}
              {initialMuseums.length !== filtered.length && <> of {initialMuseums.length}</>}
            </p>
            {(searchQuery || locationFilter) && (
              <>
                <span className="h-3.5 w-px bg-gray-200" />
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5ED] px-3 py-1 text-xs font-semibold text-[#2D903A]">
                    &ldquo;{searchQuery}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search term"
                      className="hover:text-[#123b2c]"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5ED] px-3 py-1 text-xs font-semibold text-[#2D903A]">
                    📍 {locationFilter}
                    <button
                      type="button"
                      onClick={() => {
                        setCityFilter("");
                        setCountryFilter("");
                      }}
                      aria-label="Clear location filter"
                      className="hover:text-[#123b2c]"
                    >
                      &times;
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCountryFilter("");
                    setCityFilter("");
                  }}
                  className="text-xs font-semibold text-gray-400 underline hover:text-gray-600"
                >
                  Reset all
                </button>
              </>
            )}
          </div>
        )}

        {/* Museums Cards Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 p-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F7F5] text-[#184E3A]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="M19.5 19.5 15.2 15.2" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-sm text-gray-500">
              No museums found matching your search. Try changing the location or search terms.
            </p>
            {!showHeader && (searchQuery || locationFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCountryFilter("");
                  setCityFilter("");
                }}
                className="rounded-full border border-[#184E3A]/25 px-4 py-2 text-xs font-bold text-[#184E3A] transition hover:bg-[#184E3A] hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
            {filtered.map((m) => {
              const rating = m.rating || 4.7;
              const reviews = m.reviewsCount || "10.2k";
              const locationLabel = `${m.city}, ${m.country}`;

              return (
                <article
                  key={m.id}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.09)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Card Image with Location Badge */}
                  <Link
                    href={`/${m.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 block"
                  >
                    <SafeImage
                      src={m.cardImage || m.heroImage}
                      alt={m.cardImageAlt || m.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Location Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 shadow-sm border border-white/60">
                      <svg
                        className="w-3 h-3 text-[#2D903A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-[11px] font-semibold text-[#1F2429]">
                        {locationLabel}
                      </span>
                    </div>
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1F2429] group-hover:text-[#2D903A] transition-colors leading-snug">
                        <Link href={`/${m.slug}`}>{m.name}</Link>
                      </h3>

                      <p className="mt-2 text-xs sm:text-[13px] text-[#54595F] leading-relaxed line-clamp-2">
                        {m.cardTagline ||
                          `${m.name} in ${m.city}, ${m.country} is one of the most visited cultural landmarks.`}
                      </p>
                    </div>

                    {/* Card Footer: Rating & Explore Link */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 text-xs text-[#54595F]">
                        <span className="text-[#E2A03F] text-sm">★</span>
                        <span className="font-bold text-[#1F2429]">{rating.toFixed(1)}</span>
                        <span className="text-gray-400">({reviews} reviews)</span>
                      </div>

                      {/* Explore Link */}
                      <Link
                        href={`/${m.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1F2429] group-hover:text-[#2D903A] transition-colors"
                      >
                        <span>Explore</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
