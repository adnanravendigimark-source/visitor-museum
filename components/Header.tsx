import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import HeaderNav from "./HeaderNav";
import StickyHeader from "./StickyHeader";
import { getHomepageContent } from "@/lib/homepage";
import { getMuseums } from "@/lib/museums";

export default async function Header() {
  const [content, museums] = await Promise.all([getHomepageContent(), getMuseums()]);
  const header = content.header || {};
  const ctaText = (header as any).buttonText || header.ctaText || header.bookNowText || "Explore Museums";
  const ctaHref = (header as any).buttonHref || header.ctaHref || "/#museums";

  // The 4 museum ticket links in the header are never a saved/static list —
  // they're computed here, every request, from whichever museums are
  // currently marked "Featured" in the Museums admin (same source and same
  // sort order as the homepage grid). Add, remove, reorder, or un-feature a
  // museum there and the header updates on its own, with no separate nav
  // link to remember to edit.
  const featured = museums.filter((m) => m.featured);
  const spotlightMuseums = (featured.length ? featured : museums).slice(0, 4);
  const museumLinks = spotlightMuseums.map((m) => ({ label: m.name, href: `/${m.slug}` }));

  // Anything else the admin has added under Homepage -> Navbar -> "Nav
  // links" (About Us, Blog, or any other page) shows after the museum
  // links. Defensively drop any entry that duplicates one of the museum
  // links above (leftover from before this was auto-generated) so the same
  // museum never appears twice while older saved data catches up. Contact
  // is deliberately kept out of the header nav (still reachable from the
  // footer and every page's own links) — remove this filter if that should
  // ever change.
  const museumHrefs = new Set(museums.map((m) => `/${m.slug}`));
  const extraLinks = (header.navLinks || []).filter(
    (l) => !museumHrefs.has(l.href) && l.href !== "/contact"
  );

  const navLinks = [...museumLinks, ...extraLinks];

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

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <Link
            href={ctaHref}
            className="hidden items-center justify-center whitespace-nowrap rounded-full bg-[#184E3A] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#123b2c] hover:shadow-md sm:inline-flex sm:text-sm"
          >
            {ctaText}
          </Link>
          <MobileNav links={navLinks} ctaText={ctaText} ctaHref={ctaHref} />
        </div>
      </div>
    </StickyHeader>
  );
}
