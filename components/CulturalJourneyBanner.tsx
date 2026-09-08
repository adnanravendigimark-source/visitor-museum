import Link from "next/link";
import SafeImage from "./SafeImage";
import { getHomepageContent } from "@/lib/homepage";

export default async function CulturalJourneyBanner() {
  const content = await getHomepageContent();
  const s = content.sections.highlights;
  const cta = content.sections.ctaBanner;

  const eyebrow = s?.eyebrow || "YOUR NEXT CULTURAL JOURNEY";
  const heading = s?.heading || "Plan Your Museum Adventure";
  const subheading =
    s?.subheading ||
    "Get the latest museum news, travel tips, exhibition highlights and insider guides — all in one place.";
  const buttonText = cta?.buttonText || "Explore Articles →";
  const buttonHref = cta?.buttonHref || "/blog";

  const cards =
    s?.cards && s.cards.length >= 4
      ? s.cards
      : [
          { icon: "🏛️", title: "Museum Guides", body: "Tips for your next trip" },
          { icon: "📰", title: "Latest News", body: "Updates & exhibitions" },
          { icon: "🗝️", title: "Insider Tips", body: "Make the most of your visit" },
          { icon: "🧳", title: "Travel Inspiration", body: "Discover new places" },
        ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#F2F7F4] p-8 sm:p-12 lg:p-14 border border-[#E3EFE7]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Visual: Tilted Polaroid Photo Cards */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-64 h-72 sm:w-72 sm:h-80 select-none">
                {/* Background Gallery Photo (Tilted Right) */}
                <div className="absolute right-0 top-4 w-44 sm:w-48 aspect-[3/4] rounded-2xl bg-white p-2.5 shadow-xl border border-gray-100 rotate-6 transition-transform hover:rotate-3 duration-300">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200">
                    <SafeImage
                      src="/images/gallery-corridor.jpg"
                      alt="Grand museum corridor"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Foreground David Statue Polaroid (Tilted Left) */}
                <div className="absolute left-0 bottom-2 w-48 sm:w-52 rounded-2xl bg-white p-3 shadow-2xl border border-gray-100 -rotate-6 transition-transform hover:rotate-0 duration-300 z-10">
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-gray-200">
                    <SafeImage
                      src="/images/david-sculpture.jpg"
                      alt="Michelangelo David sculpture"
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                  <div className="pt-2 text-center">
                    <p className="font-serif italic text-xs sm:text-[13px] text-[#2D903A] font-medium tracking-wide">
                      Art inspires
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content: Eyebrow, Heading, Subtext & CTA */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-3.5">
              <div className="flex flex-col items-center lg:items-start">
                <span className="h-[3px] w-8 rounded-full bg-[#2D903A]" />
                <span className="mt-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#54595F]">
                  {eyebrow}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-[#1F2429] leading-[1.2]">
                {heading}
              </h2>

              <p className="text-xs sm:text-sm text-[#54595F] leading-relaxed">
                {subheading}
              </p>

              <div className="pt-3">
                <Link
                  href={buttonHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#1e4945] hover:bg-[#163835] text-white px-7 py-3 text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow-md"
                >
                  {buttonText}
                </Link>
              </div>
            </div>

            {/* Right Side: 2x2 Feature Highlights with Circle Badges */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {cards.slice(0, 4).map((card, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm transition-all hover:bg-white"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E0ECE5] text-base">
                    {card.icon}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold text-[#1F2429] leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-[#54595F] leading-tight mt-0.5">
                      {card.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
