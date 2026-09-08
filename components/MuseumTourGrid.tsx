import SafeImage from "./SafeImage";
import { getToursByMuseum } from "@/lib/museums";
import type { Museum } from "@/lib/museums";
import { stripHtml } from "@/lib/seo";

export default async function MuseumTourGrid({ museum, bookNowText = "Book Tickets" }: { museum: Museum; bookNowText?: string }) {
  const tours = await getToursByMuseum(museum.id);
  if (!tours.length) return null;

  return (
    <section id="tickets" className="py-16 sm:py-20 bg-[#FAF8F5]/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">{museum.toursEyebrow}</p>
          <h2 className="mt-2.5 font-serif text-3xl sm:text-[2.25rem] font-bold text-[#112338] tracking-tight">
            {museum.toursHeading}
          </h2>
          {museum.toursSubheading && <p className="mt-2.5 text-xs sm:text-sm text-[#556476]">{museum.toursSubheading}</p>}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className={`group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 ${
                tour.featured
                  ? "border-2 border-[#B85D3E] shadow-lg shadow-[#B85D3E]/10 relative ring-1 ring-[#B85D3E]/20"
                  : "border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:border-[#CBD5E1]"
              }`}
            >
              <div className="relative aspect-[16/9.5] w-full overflow-hidden bg-gray-900">
                <SafeImage
                  src={tour.image}
                  alt={tour.imageAlt}
                  fill
                  quality={70}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {tour.ribbon && (
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md bg-[#B85D3E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    <span>👑</span>
                    <span>{tour.ribbon}</span>
                  </div>
                )}
                <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#112338] shadow-sm">
                  <span className="text-[#00B67A]">★</span>
                  <span>{tour.rating}</span>
                  <span className="text-[#718096] font-normal">({tour.reviews})</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-[15px] sm:text-base font-bold text-[#112338] leading-snug group-hover:text-[#B85D3E] transition-colors line-clamp-2 min-h-[44px]">
                  <a href={tour.href} target="_blank" rel="noopener nofollow sponsored">
                    {tour.title}
                  </a>
                </h3>

                <p className="mt-1.5 text-xs text-[#556476] leading-relaxed line-clamp-2">
                  {stripHtml(tour.description)}
                </p>

                {tour.includes.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {tour.includes.slice(0, 3).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-md bg-[#FAF8F5] px-2.5 py-1.5 text-[11.5px] text-[#2D3748] border border-[#F0EBE1]"
                      >
                        <span className="mt-0.5 text-[#B85D3E] font-bold shrink-0">✓</span>
                        <span className="leading-tight font-medium line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tour.duration && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#718096]">
                    <span>⏱</span>
                    <span className="font-medium">{tour.duration}</span>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                    <div>
                      <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#718096]">FROM</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#112338]">
                          {museum.currencySymbol}{tour.price}
                        </span>
                        <span className="text-[11px] text-[#718096]">/person</span>
                      </div>
                    </div>

                    <a
                      href={tour.href}
                      target="_blank"
                      rel="noopener nofollow sponsored"
                      className="inline-flex items-center justify-center rounded-lg bg-[#112338] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1a3452] hover:shadow-md"
                    >
                      {bookNowText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
