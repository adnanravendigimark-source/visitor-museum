import Link from "next/link";
import SafeImage from "./SafeImage";
import type { Museum } from "@/lib/museums";
import { getMuseums } from "@/lib/museums";
import { getNearbyMuseums, nearbyHeading } from "@/lib/nearby";

// Dynamic, DB-driven "Other Attractions in {City}" section. Every museum
// with valid lat/lng coordinates automatically becomes eligible to appear
// here for every OTHER museum within range — nothing about which
// attractions are "nearby" is hardcoded; it's computed fresh from the
// coordinates stored in the CMS every time the page renders (see
// lib/nearby.ts). Works identically for Paris, Florence, Zurich, or any
// future city added through the admin panel.
export default async function NearbyAttractions({ museum }: { museum: Museum }) {
  const allMuseums = await getMuseums();
  const nearby = await getNearbyMuseums(museum, allMuseums);
  if (!nearby.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-[#EAE6DE]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
            Nearby Attractions
          </p>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#112338] leading-[1.2] tracking-tight">
            {nearbyHeading(museum)}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#556476] leading-relaxed">
            Other museums and attractions worth visiting while you're in {museum.city}, sorted by distance.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nearby.map(({ museum: m, mode, distanceKm, durationMinutes }) => (
            <Link
              key={m.id}
              href={`/${m.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#CBD5E1]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                <SafeImage
                  src={m.cardImage || m.heroImage}
                  alt={m.cardImageAlt || m.name}
                  fill
                  quality={65}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#112338] shadow-sm">
                  <span>{mode === "walk" ? "🚶" : "🚗"}</span>
                  <span>
                    {durationMinutes} min {mode === "walk" ? "walk" : "drive"} · {distanceKm.toFixed(1)} km
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B85D3E]">{m.city}, {m.country}</p>
                <h3 className="mt-1 font-serif text-base font-bold text-[#112338] leading-snug group-hover:text-[#B85D3E] transition-colors">
                  {m.name}
                </h3>
                {m.cardTagline && <p className="mt-1.5 text-xs text-[#556476] line-clamp-2">{m.cardTagline}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
