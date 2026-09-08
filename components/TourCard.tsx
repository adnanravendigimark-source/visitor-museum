import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import type { Tour } from "@/lib/museums";

export default function TourCard({
  tour,
  bookNowText = "Book Now",
  currencySymbol = "€",
}: {
  tour: Tour;
  recommended?: any;
  bookNowText?: string;
  currencySymbol?: string;
}) {
  const highlights = tour.highlights && tour.highlights.length > 0 ? tour.highlights : tour.includes;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <SafeImage
          src={tour.image}
          alt={tour.imageAlt || tour.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        {tour.ribbon && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-[#2D903A] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            <span>★</span>
            {tour.ribbon}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 text-center">
        <h2 className="text-xl font-bold leading-snug text-[#2A302F] min-h-[3rem] flex items-center justify-center">
          {tour.title}
        </h2>

        {/* Highlighted Price with Underline */}
        <div className="my-4">
          {tour.originalPrice && tour.originalPrice > tour.price && (
            <span className="mr-2 text-base text-[#8A9BA8] line-through">
              {currencySymbol}{tour.originalPrice}
            </span>
          )}
          <span className="relative inline-block text-2xl sm:text-3xl font-extrabold text-[#2A302F]">
            {currencySymbol}{tour.price}
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#2D903A] rounded-full" />
          </span>
        </div>

        {tour.duration && (
          <p className="-mt-2 mb-3 text-xs font-medium text-[#7A7A7A]">⏱ {tour.duration}</p>
        )}

        {/* Feature List */}
        <ul className="my-3 space-y-2 text-left text-sm text-[#54595F] flex-1">
          {highlights.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#2D903A] font-bold shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Book Now Button */}
        <div className="mt-6 pt-2">
          <a
            href={tour.href}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="inline-block w-full max-w-[200px] rounded-full bg-[#2D903A] py-2.5 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23782F]"
          >
            {bookNowText}
          </a>
        </div>

        {/* Rating & Reviews */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center justify-center gap-1 text-xs text-[#7A7A7A]">
          <span className="font-medium">Reviews: {tour.reviews.toLocaleString()}</span>
          <StarRating rating={tour.rating} showValue size="sm" />
        </div>
      </div>
    </div>
  );
}
