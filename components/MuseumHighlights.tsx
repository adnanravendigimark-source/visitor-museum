import type { Museum } from "@/lib/museums";

export default function MuseumHighlights({ museum }: { museum: Museum }) {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 space-y-12">
        {/* "What You'll See" — the address/hours/best-time content that used
            to be duplicated into side boxes here now lives once, in
            MuseumPracticalInfo (opening hours, address, best time to visit)
            and MuseumPriceComparison (the actual ticket price table), both
            rendered right after this section. */}
        <div className="space-y-4">
          {museum.highlightsEyebrow && (
            <span className="block text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
              {museum.highlightsEyebrow}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2A302F]">
            {museum.highlightsHeading || `Types of ${museum.name} Tickets`}
          </h2>
          {museum.highlightsSubheading && (
            <p className="text-sm text-[#54595F] leading-relaxed max-w-2xl">
              {museum.highlightsSubheading}
            </p>
          )}
          {museum.highlights.length > 0 && (
            <ol className="space-y-4 text-sm text-[#54595F] list-decimal pl-5 leading-relaxed pt-2">
              {museum.highlights.map((h, i) => (
                <li key={i}>
                  <strong className="text-[#2A302F]">{h.title}: </strong>
                  {h.body}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2A302F]">
            {museum.aboutHeading || `Things to do in ${museum.name}`}
          </h2>
          <div
            className="rich-content text-sm text-[#54595F] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: museum.aboutBody || "" }}
          />
        </div>
      </div>
    </section>
  );
}
