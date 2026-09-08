import TourPromoCard from "./TourPromoCard";
import { getTourById, getMuseumById } from "@/lib/museums";

export default async function RecommendedTour({
  tourId,
  recommendedLabel,
}: {
  tourId: string;
  recommendedLabel?: string;
}) {
  if (!tourId) return null;
  const tour = await getTourById(tourId);
  if (!tour) return null;
  const museum = await getMuseumById(tour.museumId);
  return (
    <TourPromoCard
      tour={tour}
      recommendedLabel={recommendedLabel || undefined}
      currencySymbol={museum?.currencySymbol || "€"}
    />
  );
}
