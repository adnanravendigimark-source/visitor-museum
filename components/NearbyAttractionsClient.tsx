"use client";

import { useState } from "react";
import type { NearbyPlace } from "@/lib/nearbyPlaces";

interface NearbyAttractionsClientProps {
  currentMuseumName: string;
  places: NearbyPlace[];
}

const BOOKING_URL = "https://www.headout.com/r/visit-museumsrecommends-PMrId/";

export default function NearbyAttractionsClient({ currentMuseumName, places }: NearbyAttractionsClientProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "walk" | "drive">("all");

  const walkCount = places.filter((p) => p.mode === "walk").length;
  const driveCount = places.filter((p) => p.mode === "drive").length;

  const filtered = places.filter((p) => {
    if (activeFilter === "walk") return p.mode === "walk";
    if (activeFilter === "drive") return p.mode === "drive";
    return true;
  });

  return (
    <section className="py-16 sm:py-20 bg-[#FBFBFA] border-t border-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2EC] px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-[#184E3A]">
            📍 Proximity & Location Guide
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-[#182220] tracking-tight">
            Nearby Attractions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#55605E] leading-relaxed">
            Real points of interest close to <strong className="text-gray-800">{currentMuseumName}</strong>, sourced live from OpenStreetMap.
          </p>

          {/* Filter Pills — mode only, no distance numbers shown anywhere */}
          {(walkCount > 0 || driveCount > 0) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeFilter === "all"
                    ? "bg-[#184E3A] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                All ({places.length})
              </button>
              {walkCount > 0 && (
                <button
                  onClick={() => setActiveFilter("walk")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    activeFilter === "walk"
                      ? "bg-[#184E3A] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span>🚶</span>
                  <span>Walking ({walkCount})</span>
                </button>
              )}
              {driveCount > 0 && (
                <button
                  onClick={() => setActiveFilter("drive")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    activeFilter === "drive"
                      ? "bg-[#184E3A] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span>🚕</span>
                  <span>By Car ({driveCount})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cards Grid — matches the same card language as the ticket cards
            and the Other Attractions section (image block on top, centered
            content below). OpenStreetMap doesn't supply photos for these
            real-world points of interest, so the "image" is a colored
            icon tile instead of a fake photo — never distance/time text. */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => (
            <a
              key={place.id}
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Icon block standing in for a photo — OpenStreetMap doesn't
                  supply photos for these real-world points of interest, so
                  a textured badge treatment is used instead of a fake photo
                  or a plain emoji floating on flat color. */}
              <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-gradient-to-br from-[#F0F6F2] via-[#E4F0E8] to-[#D2E5DA]">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(24,78,58,0.12) 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
                  <span className="text-4xl leading-none">{place.icon}</span>
                </div>
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#184E3A] shadow-sm">
                  {place.mode === "walk" ? "🚶 On Foot" : "🚕 By Car"}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 text-center">
                <h3 className="min-h-[3rem] text-xl font-bold leading-snug text-[#2A302F] flex items-center justify-center group-hover:text-[#184E3A] transition-colors">
                  {place.name}
                </h3>

                <p className="mt-3 text-sm font-medium text-[#8A9BA8] flex-1">{place.category}</p>

                <div className="mt-6 pt-2">
                  <span className="inline-flex w-full max-w-[220px] items-center justify-center gap-1.5 rounded-full bg-[#184E3A] py-2.5 px-6 text-sm font-semibold text-white shadow-sm transition group-hover:bg-[#123b2c]">
                    Explore and Book Now <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
