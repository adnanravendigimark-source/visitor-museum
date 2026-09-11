import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import HeaderNav from "./HeaderNav";
import StickyHeader from "./StickyHeader";
import { CompassIcon } from "./icons";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums } from "@/lib/museums";

export default async function Header() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);
  const header = content.header || {};
  const searchIndex = museums.map((m) => ({
    slug: m.slug,
    name: m.name,
    city: m.city,
    country: m.country,
    cardImage: m.cardImage,
    cardImageAlt: m.cardImageAlt,
  }));
  // Read only the real HeaderContent fields (ctaText/ctaHref, edited from
  // Homepage admin -> Navbar -> "Button text"/"Button link"). This used to
  // also check `(header as any).buttonText`/`.buttonHref` first — leftover
  // field names from an old one-off content-sync script
  // (scripts/sync-content.mjs) that wrote a differently-shaped header_json
  // blob. Since that script's stray `buttonText`/`buttonHref` keys survive
  // in the DB row indefinitely (parseJsonWithDefault merges onto DEFAULT_
  // HEADER without stripping unknown keys, and every save writes the whole
  // object back), a database that ever had that script run against it
  // would have this button permanently pinned to those old values — no
  // admin edit to ctaText/ctaHref could ever override them, since they
  // were checked first. Reading ctaText/ctaHref directly, with no legacy
  // fallback, is what actually keeps this button obeying the admin.
  const ctaText = header.ctaText || header.bookNowText || "Explore Museums";
  const ctaHref = header.ctaHref || "/#museums";
  const navLinks = header.navLinks || [];

  return (
    <StickyHeader>
      <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:gap-6">
        <div className="shrink-0">
          <Logo
            logoImage={header.logoImage}
            logoAlt={header.logoAlt || "Visit Museums"}
          />
        </div>

        <HeaderNav links={navLinks} />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href={ctaHref}
            className="group hidden items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#184E3A] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#123b2c] hover:shadow-md sm:inline-flex sm:text-sm"
          >
            <CompassIcon className="h-4 w-4 text-white shrink-0 transition-transform group-hover:rotate-45" />
            <span>{ctaText}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <MobileNav links={navLinks} ctaText={ctaText} ctaHref={ctaHref} museums={searchIndex} />
        </div>
      </div>
    </StickyHeader>
  );
}
