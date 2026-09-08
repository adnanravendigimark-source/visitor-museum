import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import type { Tour } from "@/lib/museums";

export default function TourPromoCard({
  tour,
  recommendedLabel = "Recommended Option",
  bookNowText = "Book Tickets",
  currencySymbol = "€",
}: {
  tour: Tour;
  recommendedLabel?: string;
  bookNowText?: string;
  currencySymbol?: string;
}) {
  return (
    <div className="my-10 flex flex-col gap-6 overflow-hidden rounded-2xl border border-warmstone-300 bg-gradient-to-br from-warmstone-100/70 via-cream-50 to-warmstone-100/40 p-6 shadow-md sm:flex-row sm:items-center">
      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-44 shadow-sm">
        <SafeImage src={tour.image} alt={tour.imageAlt} fill quality={65} sizes="200px" className="object-cover" />
      </div>
      <div className="flex-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-olive-700">
          {recommendedLabel}
        </span>
        <p className="mt-1 font-display text-lg font-bold text-charcoal-800">{tour.title}</p>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-charcoal-600">
          <StarRating rating={tour.rating} showValue reviewCount={tour.reviews} size="xs" />
          <span>·</span>
          <span>from {currencySymbol}{tour.price}/person</span>
        </div>
      </div>
      <a
        href={tour.href}
        target="_blank"
        rel="noopener nofollow sponsored"
        className="shrink-0 rounded-xl bg-olive-700 px-6 py-3 text-center text-sm font-bold text-cream-100 shadow-md ring-1 ring-sage-400/30 transition hover:bg-olive-800 hover:scale-[1.02]"
      >
        {bookNowText}
      </a>
    </div>
  );
}
