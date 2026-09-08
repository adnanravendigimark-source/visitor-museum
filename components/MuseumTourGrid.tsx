import TourCard from "./TourCard";
import { getToursByMuseum } from "@/lib/museums";
import type { Museum } from "@/lib/museums";

export default async function MuseumTourGrid({
  museum,
  bookNowText = "Book Now",
}: {
  museum: Museum;
  bookNowText?: string;
}) {
  const tours = await getToursByMuseum(museum.id);
  if (!tours.length) return null;

  return (
    <section id="tickets" className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        {(museum.toursEyebrow || museum.toursHeading || museum.toursSubheading) && (
          <div className="mb-10 max-w-2xl text-center mx-auto">
            {museum.toursEyebrow && (
              <span className="block text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
                {museum.toursEyebrow}
              </span>
            )}
            {museum.toursHeading && (
              <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold text-[#2A302F]">{museum.toursHeading}</h2>
            )}
            {museum.toursSubheading && (
              <p className="mt-3 text-sm text-[#54595F] leading-relaxed">{museum.toursSubheading}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tours.slice(0, 3).map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              bookNowText={bookNowText}
              currencySymbol={museum.currencySymbol}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
