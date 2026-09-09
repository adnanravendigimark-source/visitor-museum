import Link from "next/link";
import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import type { Museum } from "@/lib/museums";
import { getMuseums } from "@/lib/museums";
import { getSameCityAttractions, otherAttractionsHeading } from "@/lib/nearby";

export default async function OtherAttractionsInCity({ museum }: { museum: Museum }) {
  const allMuseums = await getMuseums();
  const attractions = getSameCityAttractions(museum, allMuseums);

  // Nothing else booked through this site in this city yet — correct to
  // stay hidden rather than substituting in an attraction from elsewhere.
  if (!attractions.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2EC] px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-[#184E3A]">
            🎟️ More To Explore
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-[#182220] tracking-tight">
            {otherAttractionsHeading(museum)}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#55605E] leading-relaxed">
            More museums and attractions worth booking in <strong className="text-gray-800">{museum.city}</strong>, alongside {museum.name}.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map(({ museum: m }) => (
            <div
              key={m.id}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Image */}
              <Link href={`/${m.slug}`} className="relative aspect-[3/2] block overflow-hidden bg-gray-100">
                <SafeImage
                  src={m.cardImage || m.heroImage}
                  alt={m.cardImageAlt || m.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 text-center">
                <h3 className="min-h-[3rem] text-xl font-bold leading-snug text-[#2A302F] flex items-center justify-center">
                  <Link href={`/${m.slug}`} className="hover:text-[#184E3A] transition-colors">
                    {m.name}
                  </Link>
                </h3>

                <p className="mt-3 text-sm text-[#54595F] leading-relaxed flex-1">
                  {m.cardTagline || `${m.name} is a premier cultural landmark in ${m.city}, offering unforgettable art and historic exhibitions.`}
                </p>

                <div className="mt-6 pt-2">
                  <Link
                    href={`/${m.slug}`}
                    className="inline-block w-full max-w-[220px] rounded-full bg-[#184E3A] py-2.5 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b2c]"
                  >
                    Explore and Book Now
                  </Link>
                </div>

                {/* Rating & Reviews */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center justify-center gap-1 text-xs text-[#7A7A7A]">
                  <span className="font-medium">Reviews: {m.reviewsCount || "10.2k"}</span>
                  <StarRating rating={m.rating ?? 4.7} showValue size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
