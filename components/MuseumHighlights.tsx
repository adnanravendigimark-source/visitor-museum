import type { Museum } from "@/lib/museums";

export default function MuseumHighlights({ museum }: { museum: Museum }) {
  if (!museum.highlights.length) return null;

  return (
    <section className="py-20 sm:py-24 bg-[#FAF8F5] border-t border-[#EAE6DE]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
            {museum.highlightsEyebrow}
          </p>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#112338] leading-[1.2] tracking-tight">
            {museum.highlightsHeading || `Must-See Highlights at ${museum.name}`}
          </h2>
          {museum.highlightsSubheading && (
            <p className="mt-3 text-xs sm:text-sm text-[#556476] leading-relaxed">{museum.highlightsSubheading}</p>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {museum.highlights.map((card, i) => (
            <div key={i} className="rounded-2xl border border-[#E8ECEF] bg-white p-6 shadow-sm transition hover:border-[#B85D3E]/40 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3EA] text-xl">
                {card.icon || "✨"}
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#112338]">{card.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#556476]">{card.body}</p>
            </div>
          ))}
        </div>

        {museum.aboutBody && (
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-12 rounded-2xl border border-[#E8ECEF] bg-white p-7 sm:p-9 shadow-sm">
              {museum.aboutHeading && (
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#112338]">{museum.aboutHeading}</h3>
              )}
              <div
                className="rich-content mt-4 text-xs sm:text-sm text-[#556476] leading-relaxed max-w-3xl"
                dangerouslySetInnerHTML={{ __html: museum.aboutBody }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
