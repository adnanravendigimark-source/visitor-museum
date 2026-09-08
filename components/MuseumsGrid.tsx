import Link from "next/link";
import SafeImage from "./SafeImage";
import { getMuseums } from "@/lib/museums";
import { getHomepageContent } from "@/lib/homepage";

export default async function MuseumsGrid() {
  const [museums, { sections }] = await Promise.all([getMuseums(), getHomepageContent()]);
  const s = sections.grid;

  return (
    <section id="museums" className="py-16 sm:py-20 bg-[#FAF8F5]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">{s.eyebrow}</p>
          <h2 className="mt-2.5 font-serif text-3xl sm:text-[2.25rem] font-bold text-[#112338] tracking-tight">
            {s.heading}
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[#556476]">{s.subheading}</p>
        </div>

        {museums.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#8A9BA8]">No museums published yet — check back soon.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {museums.map((m) => (
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
                    quality={70}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {m.featured && (
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md bg-[#B85D3E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#B85D3E]">{m.city}, {m.country}</p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#112338] leading-snug group-hover:text-[#B85D3E] transition-colors">
                    {m.name}
                  </h3>
                  {m.cardTagline && <p className="mt-1.5 text-xs text-[#556476] line-clamp-2">{m.cardTagline}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#112338]">
                    Compare tickets →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
