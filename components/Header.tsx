import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import HeaderNav from "./HeaderNav";
import HeaderSearch from "./HeaderSearch";
import { getHomepageContent } from "@/lib/homepage";

export default async function Header() {
  const content = await getHomepageContent();
  const header = content.header || {};
  const navLinks = header.navLinks || [];
  const ctaText = (header as any).buttonText || header.ctaText || header.bookNowText || "Explore Museums";
  const ctaHref = (header as any).buttonHref || header.ctaHref || "/#museums";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200">
      <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 xl:gap-6">
        <div className="shrink-0">
          <Logo
            logoImage={header.logoImage}
            logoAlt={header.logoAlt || "Visit Museums"}
          />
        </div>

        <HeaderNav links={navLinks} />

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <HeaderSearch />
          <Link
            href={ctaHref}
            className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#184E3A] hover:bg-[#123b2c] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow-md"
          >
            {ctaText}
          </Link>
          <MobileNav links={navLinks} ctaText={ctaText} ctaHref={ctaHref} />
        </div>
      </div>
    </header>
  );
}
