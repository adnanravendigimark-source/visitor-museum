import TourCard from "./TourCard";
import { getOtherAttractionsByMuseum, toTourCardShape } from "@/lib/otherAttractions";

// Replaces the old auto-resolved "Nearby Attractions" feature (which
// pulled real places live from OpenStreetMap by coordinate). Every card
// here is admin-authored for this exact museum, under that museum's own
// "Manage Other Attractions" screen (/admin/attractions/[museumId]) — see
// lib/otherAttractions.ts. Reuses TourCard directly so these cards are
// visually identical to the museum's own tickets, per the admin's request.
export default async function OtherAttractionsSection({
  museumId,
  city,
  currencySymbol = "€",
  bookNowText = "Book Now",
}: {
  museumId: string;
  city: string;
  currencySymbol?: string;
  bookNowText?: string;
}) {
  const attractions = await getOtherAttractionsByMuseum(museumId);
  if (!attractions.length) return null;

  return (
    <section className="border-t border-gray-100 bg-[#FBFBFA] py-16 sm:py-20">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5ED] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#184E3A]">
            🏛️ Explore More
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A302F]">
            Other Attractions in {city}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
          {attractions.map((a) => (
            <TourCard
              key={a.id}
              tour={toTourCardShape(a)}
              bookNowText={bookNowText}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
