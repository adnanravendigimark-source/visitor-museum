import SafeImage from "./SafeImage";
import type { Museum } from "@/lib/museums";

export default function MuseumHero({ museum }: { museum: Museum }) {
  return (
    <section className="relative w-full bg-[#FAF8F5] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SafeImage
          src={museum.heroImage}
          alt={museum.heroImageAlt || museum.name}
          fill
          priority
          quality={68}
          sizes="100vw"
          className="object-cover object-[75%_top] sm:object-right-top lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 via-40% lg:via-50% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF8F5] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-8 sm:pt-10 lg:pt-14 pb-12 lg:pb-16">
        <div className="max-w-xl">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#B85D3E]">
            {museum.heroBadge || `${museum.city.toUpperCase()} · TICKETS & TOURS`}
          </p>

          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.14] tracking-tight text-[#112338]">
            {museum.heroHeading}
          </h1>

          <div className="mt-3.5 mb-5 h-[2.5px] w-10 rounded-full bg-[#B85D3E]" />

          <div
            className="rich-content text-xs sm:text-sm text-[#556476] leading-relaxed max-w-md"
            dangerouslySetInnerHTML={{ __html: museum.heroSubheading }}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3.5">
            <a
              href="#tickets"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#112338] px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1a3452] hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>{museum.ctaButtonText || "Compare Tickets & Tours"}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#practical"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white/95 backdrop-blur-sm px-6 py-3 text-xs font-semibold text-[#112338] shadow-sm transition-all hover:bg-white hover:border-[#94A3B8] hover:-translate-y-0.5"
            >
              <span>Visitor Info</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
