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
}: {
  initialMuseums: Museum[];
  eyebrow?: string;
  heading?: string;
  subheading?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    function handleSearchEvent(e: Event) {
      const custom = e as CustomEvent<{ query: string; location: string }>;
      if (custom.detail) {
        setSearchQuery(custom.detail.query || "");
        setLocationFilter(custom.detail.location || "");
      }
    }

    // Check URL params on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const loc = params.get("loc") || "";
      if (q || loc) {
        setSearchQuery(q);
        setLocationFilter(loc);
      }
    }

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

      const matchLocation =
        !locationFilter.trim() ||
        m.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        m.country.toLowerCase().includes(locationFilter.toLowerCase());

      return matchQuery && matchLocation;
    });
  }, [initialMuseums, searchQuery, locationFilter]);

  return (
    <section id="museums" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
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

        {/* Active Filters Display */}
        {(searchQuery || locationFilter) && (
          <div className="mb-8 flex items-center gap-2 text-xs text-gray-500">
            <span>Showing results for:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF5ED] px-3 py-1 font-semibold text-[#2D903A]">
                &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-black ml-1"
                >
                  &times;
                </button>
              </span>
            )}
            {locationFilter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF5ED] px-3 py-1 font-semibold text-[#2D903A]">
                📍 {locationFilter}
                <button
                  type="button"
                  onClick={() => setLocationFilter("")}
                  className="hover:text-black ml-1"
                >
                  &times;
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("");
              }}
              className="ml-2 text-xs font-semibold text-gray-400 hover:text-gray-600 underline"
            >
              Reset
            </button>
          </div>
        )}

        {/* Museums Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500">
            No museums found matching your search. Try changing the location or search terms.
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
