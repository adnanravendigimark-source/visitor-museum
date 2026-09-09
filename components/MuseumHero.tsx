import SafeImage from "./SafeImage";
import type { Museum } from "@/lib/museums";

export default function MuseumHero({ museum }: { museum: Museum }) {
  const badge = museum.heroBadge || `${museum.name.toUpperCase()} TICKETS`;

  return (
    <div>
      {/* Top Panoramic Hero Banner with Dark Overlay */}
      <section className="relative w-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-gray-900 overflow-hidden text-center text-white px-4 py-16">
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={museum.heroImage}
            alt={museum.heroImageAlt || museum.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50 brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-white">
            {badge}
          </h2>
          <div
            className="text-sm sm:text-base text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: museum.heroSubheading || "" }}
          />
        </div>
      </section>

      {/* Main Page Centered Title Section */}
      <section className="pt-12 pb-6 bg-white text-center">
        <div className="mx-auto max-w-[1140px] px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2A302F]">
            {museum.heroHeading || `${museum.name} Tickets & Tour`}
          </h1>
        </div>
      </section>
    </div>
  );
}
