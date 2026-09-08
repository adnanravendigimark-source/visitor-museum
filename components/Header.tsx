import Link from "next/link";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import HeaderNav from "./HeaderNav";
import { getHomepageContent } from "@/lib/homepage";

export default async function Header() {
  const content = await getHomepageContent();
  const header = content.header;
  const navLinks = header.navLinks || [];
  const ctaText = header.ctaText || header.bookNowText || "Book Tickets";
  const ctaHref = header.ctaHref || "/#museums";

  return (
    <header className="sticky top-0 z-50 border-b border-[#EAE6DE]/60 bg-[#FAF8F5]/90 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Logo
          logoImage={header.logoImage}
          logoAlt={header.logoAlt || "Visit Museums"}
          line1={header.logoLine1}
          line2={header.logoLine2}
        />

        <HeaderNav links={navLinks.length ? navLinks : undefined} />

        <div className="flex items-center gap-3">
          <a
            href={ctaHref}
            className="hidden items-center gap-2.5 rounded-lg bg-[#112338] px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#1c3654] hover:shadow-md sm:inline-flex"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-3.5 w-3.5"
            >
              <path d="M3 17h14M4 17V8M8 17V8M12 17V8M16 17V8M2 8l8-5 8 5M1 17h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {ctaText.toUpperCase()}
          </a>
          <MobileNav links={navLinks || []} ctaText={ctaText} ctaHref={ctaHref} />
        </div>
      </div>
    </header>
  );
}

