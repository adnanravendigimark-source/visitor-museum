import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import type { Tour } from "@/lib/museums";
import { LockIcon } from "./icons";

export default function TourCard({
  tour,
  recommended,
  bookNowText = "Book Tickets",
  currencySymbol = "€",
}: {
  tour: Tour;
  recommended?: {
    badgeLabel: string;
    reasons: string[];
    urgencyText: string;
  };
  bookNowText?: string;
  currencySymbol?: string;
}) {
  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-marble-50 transition-all duration-300 hover:-translate-y-1 ${recommended
          ? "border-2 border-navy-700 shadow-xl shadow-navy-900/10 hover:shadow-2xl ring-1 ring-terracotta-400/40"
          : "border border-tuscan-200/90 shadow-sm hover:border-navy-600/50 hover:shadow-xl"
        }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <SafeImage
          src={tour.image}
          alt={tour.imageAlt}
          fill
          quality={70}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-navy-950/10" />

        {(recommended || tour.ribbon) && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-terracotta-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-marble-50 shadow-md ring-1 ring-terracotta-300/40">
            <span>👑</span>
            {recommended ? recommended.badgeLabel : tour.ribbon}
          </span>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-marble-50/95 px-2.5 py-1 text-xs font-bold text-navy-900 shadow-md backdrop-blur-md">
          <StarRating rating={tour.rating} showValue reviewCount={tour.reviews} size="xs" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="min-h-[3.25rem] font-display text-lg font-bold leading-snug text-navy-800 line-clamp-2 group-hover:text-terracotta-600 transition-colors">
          {tour.title}
        </h3>
        <div
          className="rich-content mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-navy-700 [&>p]:m-0 [&>p]:line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: tour.description }}
        />

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {tour.includes.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-tuscan-100/70 px-2.5 py-1 text-[11px] font-semibold text-navy-800 border border-tuscan-200"
            >
              <span className="text-terracotta-500 font-bold">✓</span>
              {item}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs font-medium text-sky-700">⏱ {tour.duration}</p>

        {recommended && recommended.reasons.length > 0 && (
          <div className="mt-3.5 rounded-xl bg-tuscan-100/90 border border-tuscan-200 p-3">
            {recommended.reasons.slice(0, 2).map((reason) => (
              <p key={reason} className="flex items-start gap-1.5 text-[11px] leading-snug text-navy-800 font-semibold">
                <span className="mt-0.5 text-terracotta-500">✓</span>
                {reason}
              </p>
            ))}
          </div>
        )}

        {/* Footer */}
        {recommended ? (
          <div className="mt-auto border-t border-tuscan-200 pt-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">from</p>
                <span className="font-display text-2xl font-bold text-navy-900">{currencySymbol}{tour.price}</span>
              </div>
              <a
                href={tour.href}
                target="_blank"
                rel="noopener nofollow sponsored"
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-bold text-marble-50 shadow-md ring-1 ring-navy-600 transition hover:bg-navy-800 hover:scale-[1.02]"
              >
                {bookNowText}
              </a>
            </div>
            {recommended.urgencyText && (
              <p className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-terracotta-600">
                <LockIcon className="h-3 w-3" /> {recommended.urgencyText}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-auto flex items-end justify-between border-t border-tuscan-200 pt-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">from</p>
              <div className="flex items-baseline gap-2">
                {tour.originalPrice && (
                  <span className="text-sm text-sky-600 line-through">{currencySymbol}{tour.originalPrice}</span>
                )}
                <span className="font-display text-2xl font-bold text-navy-900">{currencySymbol}{tour.price}</span>
                <span className="text-xs text-navy-600">/ person</span>
              </div>
            </div>
            <a
              href={tour.href}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-bold text-marble-50 shadow-md ring-1 ring-navy-600 transition hover:bg-navy-800 hover:scale-[1.02]"
            >
              {bookNowText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
