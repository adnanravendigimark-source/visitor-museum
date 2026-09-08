import { getHomepageContent } from "@/lib/homepage";

export default async function TrustHighlights() {
  const { sections } = await getHomepageContent();
  const s = sections.highlights;

  return (
    <section className="py-20 sm:py-24 bg-white border-t border-[#EAE6DE]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">{s.eyebrow}</p>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#112338] leading-[1.2] tracking-tight">
            {s.heading}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#556476] leading-relaxed">{s.subheading}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {s.cards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-[#E8ECEF] bg-[#FAF8F5] p-6 shadow-sm transition hover:border-[#B85D3E]/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {card.icon}
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#112338]">{card.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#556476]">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
