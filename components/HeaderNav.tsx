"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/homepage";

export default function HeaderNav({ links }: { links?: NavLink[] }) {
  const pathname = usePathname();

  // No local hardcoded fallback here on purpose — Header.tsx always passes
  // real links from getHomepageContent(), which already falls back to
  // lib/homepage.ts's DEFAULT_HEADER.navLinks (generic Home/About/Blog/
  // Contact) whenever nothing is saved in the DB yet. A second, different
  // hardcoded list here (this used to bake in 4 specific museum names) can
  // only go stale as museums are added, renamed, or unfeatured — exactly
  // what happened before this was removed.
  const navLinks = links || [];

  const checkIsActive = (href: string) => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");

    if (cleanHref === "") {
      return cleanPath === "";
    }
    if (cleanHref === "/blog" || cleanHref === "/category/popular") {
      return cleanPath === "/blog" || cleanPath.startsWith("/blog/") || cleanPath.startsWith("/category/");
    }
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/");
  };

  return (
    <nav className="hidden items-center gap-3.5 xl:gap-5 2xl:gap-6 lg:flex shrink-0">
      {navLinks.map((link) => {
        const isActive = checkIsActive(link.href);

        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`relative py-7 text-[13px] xl:text-[14px] 2xl:text-[14.5px] font-medium tracking-normal whitespace-nowrap transition-colors ${
              isActive
                ? "text-[#184E3A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3.5px] after:bg-[#184E3A] after:rounded-t-sm"
                : "text-[#2A302F] hover:text-[#184E3A] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[3.5px] hover:after:bg-[#184E3A] hover:after:rounded-t-sm"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
