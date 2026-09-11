import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import type { Tour } from "@/lib/museums";

// Sized to match the amsterdam-boat-tours reference card (same compact
// proportions, same "everything in one footer row" structure) — but kept
// in this site's own green branding/copy, not a copy-paste of that card's
// blue theme. The old version was noticeably taller because rating/reviews
// sat in their own separate footer block below a full-width, centered
// "Book Now" button below a separate centered price block — three stacked
// rows where the reference card uses one. Rating now overlays the photo
// (a small pill, bottom-left) and price + the button share a single row,
// which is what actually shrinks the card — nothing here was removed,
// every field (ribbon, price, was-price, duration, includes, rating,
// reviews, button) is still shown.
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
  // The tour edit form already caps "Includes" at 3 lines (see
  // MuseumTourForm.tsx), so this slice is just a safety net for any older
  // tour saved before that cap existed.
  const highlights = (tour.includes || []).slice(0, 3);

  // "Ribbon badge" in the admin form is the
  // editable field (tour.ribbon). Older tours were seeded with this same
  // promotional text (e.g. "Bestseller") in the legacy `badge` column
  // before the admin form existed — fall back to it so nothing that was
  // already live goes blank, but any admin edit always wins.
  const ribbonText = tour.ribbon || tour.badge;

  // The admin's Description field has always claimed "shown on the tour
  // card (clamped to 2 lines)" — but this component never actually
  // rendered it, so an admin editing it saw no effect on the live card at
  // all (it only fed the invisible Product JSON-LD description). Fixed
  // below by actually rendering it, clamped to 2 lines, matching what the
  // admin hint has always said. Guarded against a description that's
  // present but empty HTML (e.g. "<p></p>"), which would otherwise render
  // as a blank gap.
  const hasDescription = tour.description && tour.description.replace(/<[^>]+>/g, "").trim().length > 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <SafeImage
          src={tour.image}
          alt={tour.imageAlt || tour.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {ribbonText && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-[#2D903A] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            <span>★</span>
            {ribbonText}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-[#2A302F] shadow-md backdrop-blur-md">
          <StarRating rating={tour.rating} showValue reviewCount={tour.reviews} size="xs" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="min-h-[3.25rem] text-lg font-bold leading-snug text-[#2A302F] line-clamp-2">
          {tour.title}
        </h3>

        {tour.city && (
          <p className="mt-0.5 text-xs font-medium text-[#7A7A7A]">
            📍 {[tour.city, tour.country].filter(Boolean).join(", ")}
          </p>
        )}

        {hasDescription && (
          <div
            className="rich-content mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-[#54595F] [&>p]:m-0 [&>p]:line-clamp-2"
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />
        )}

        {highlights.length > 0 && (
          <div className="mt-3.5 space-y-1.5">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-[11.5px] text-[#54595F]"
              >
                <span className="mt-0.5 shrink-0 font-bold text-[#2D903A]">✓</span>
                <span className="line-clamp-1 font-medium leading-tight">{item}</span>
              </div>
            ))}
          </div>
        )}

        {tour.duration && <p className="mt-2.5 text-xs font-medium text-[#7A7A7A]">⏱ {tour.duration}</p>}

        {/* Footer: price and the booking button share one row, instead of
            each being its own separate full-width block. */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            {tour.originalPrice && tour.originalPrice > tour.price && (
              <span className="mr-1.5 text-sm text-[#8A9BA8] line-through">
                {currencySymbol}{tour.originalPrice}
              </span>
            )}
            <span className="text-2xl font-extrabold text-[#2A302F] sm:text-[1.7rem]">
              {currencySymbol}{tour.price}
            </span>
            <span className="ml-1 text-xs text-[#7A7A7A]">/ person</span>
          </div>
          <a
            href={tour.href}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="shrink-0 rounded-xl bg-[#2D903A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#23782F]"
          >
            {bookNowText}
          </a>
        </div>
      </div>
    </div>
  );
}
