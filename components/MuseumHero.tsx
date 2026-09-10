import Link from "next/link";
import SafeImage from "./SafeImage";
import StarRating from "./StarRating";
import Breadcrumbs from "./Breadcrumbs";
import { ShieldCheckIcon } from "./icons";
import type { Museum } from "@/lib/museums";
import type { BreadcrumbItem } from "@/lib/seo";

// One full-bleed hero instead of the old two-part layout (a washed-out,
// dark-banner "badge" section stacked on top of a separate plain-white
// "real title" section below it). That split buried the museum's own name
// as a small second-priority heading beneath a generic all-caps label,
// which was both the weak visual hierarchy and the flat, muddy look this
// replaces — the image was dimmed twice over (opacity-50 on the photo AND
// a flat black/40 layer on top), the section was short and banner-like,
// and there was no trust signal (rating, verified-partner note) anywhere
// near the fold. This now matches the same design language already
// established on the homepage's own hero (Hero.tsx): full-bleed photo,
// bottom-anchored readability gradient, serif H1, red accent bar, and a
// pill CTA — so a visitor landing here from the homepage sees one
// consistent site, not two different eras of design.
//
// museum.rating / museum.reviewsCount already existed as admin-editable
// fields (Museums admin -> Details) but were never actually rendered
// anywhere on the public site — surfacing them here via the existing
// StarRating component both fixes that gap and gives the hero a real
// trust signal.
export default function MuseumHero({
  museum,
  breadcrumbItems,
}: {
  museum: Museum;
  breadcrumbItems?: BreadcrumbItem[];
}) {
  const badge = museum.heroBadge || `${museum.name.toUpperCase()} TICKETS`;
  const heading = museum.heroHeading || `${museum.name} Tickets & Tour`;
  const rating = museum.rating ?? 0;

  return (
    <section className="relative min-h-[440px] w-full overflow-hidden bg-[#1F2429] sm:min-h-[500px] lg:min-h-[560px]">
      {/* Full-bleed photo — shown at full clarity, not pre-dimmed, so the
          gradient below is the only thing controlling legibility. */}
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={museum.heroImage}
          alt={museum.heroImageAlt || museum.name}
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover"
        />
        {/* Bottom-anchored readability scrim — darkest where the text block
            sits, fading out toward the top so the photo itself still reads
            as a real photo, not a gray rectangle. Extended slightly at the
            very top too (via the scrim covering the breadcrumb area) so
            the breadcrumb text below stays legible over a bright sky. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
      </div>

      {/* Breadcrumb lives inside the hero photo itself now — absolutely
          positioned so it doesn't add any extra height to the section or
          push the centered content down; it used to be its own separate
          white strip between the header and this hero (see Breadcrumbs.tsx
          history), which read as a bare, disconnected sliver of space
          above a much richer hero. theme="onImage" gives it light text
          with no background/border of its own since it's sitting directly
          on the photo. */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="absolute inset-x-0 top-0 z-10 px-4 pt-5 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} theme="onImage" />
        </div>
      )}

      <div className="relative z-10 flex min-h-[440px] flex-col items-center justify-end px-4 pb-10 pt-28 text-center sm:min-h-[500px] sm:pb-14 sm:pt-32 lg:min-h-[560px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 sm:text-xs">{badge}</p>

        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
          {heading}
        </h1>

        <div className="mt-3.5 h-[2.5px] w-12 rounded-full bg-[#9E2B25]" />

        {museum.heroSubheading && (
          <div
            className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: museum.heroSubheading }}
          />
        )}

        {/* Trust row: rating (only once the museum actually has reviews to
            show — a brand-new museum with no reviews yet doesn't need to
            display "0.0"), plus museum.heroTrustBadge — admin-editable
            (Museums -> this museum -> Hero), defaulting to "Authorized
            Ticket Partner". Deliberately never defaults to "Official":
            Visit Museums is an independent affiliate guide that links out
            to authorized ticket providers, not the museum's official
            ticket seller (see the About page and homepage FAQ) — an admin
            could still type "Official" in here by hand, same as any other
            free-text field, but nothing in the code suggests it. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {rating > 0 && (
            <StarRating rating={rating} reviewCount={museum.reviewsCount} theme="dark" size="sm" showValue />
          )}
          {rating > 0 && (
            <span className="hidden h-3.5 w-px bg-white/30 sm:inline-block" aria-hidden="true" />
          )}
          {museum.heroTrustBadge && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
              <ShieldCheckIcon className="h-4 w-4 text-white" />
              <span>{museum.heroTrustBadge}</span>
            </div>
          )}
        </div>

        <Link
          href="#tickets"
          className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#9E2B25] px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#7f221c] hover:shadow-lg"
        >
          <span>View Tickets & Tours</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
