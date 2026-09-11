"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/homepage";
import HeaderSearch, { type MuseumSearchEntry } from "./HeaderSearch";

export default function MobileNav({
  links,
  ctaText,
  ctaHref,
  museums = [],
}: {
  links?: NavLink[];
  ctaText?: string;
  ctaHref?: string;
  museums?: MuseumSearchEntry[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Same reasoning as HeaderNav.tsx — no local hardcoded fallback; Header.tsx
  // always passes real links sourced from the admin (with its own generic
  // default already applied upstream in lib/homepage.ts).
  const navLinks = links || [];

  const checkIsActive = (href: string) => {
    if (!pathname) return false;
    const cleanPath = pathname.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");

    if (cleanHref === "") return cleanPath === "";
    if (cleanHref === "/blog") {
      return cleanPath === "/blog" || cleanPath.startsWith("/blog/") || cleanPath.startsWith("/category/");
    }
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/");
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Menu Toggle"
        className="flex h-10 w-10 items-center justify-center text-[#2A302F] hover:text-[#184E3A] transition"
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-20 z-50 border-b border-gray-200 bg-[#F2F2F2] p-6 shadow-xl animate-in slide-in-from-top-2">
          {museums.length > 0 && (
            <div className="mb-4">
              <HeaderSearch museums={museums} defaultOpen />
            </div>
          )}
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.href);
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-2 text-[15px] font-medium border-b border-gray-200/60 transition ${
                    isActive ? "text-[#184E3A] font-bold" : "text-[#2A302F] hover:text-[#184E3A]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {ctaText && ctaHref && (
              <div className="pt-3">
                <Link
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#184E3A] py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b2c]"
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
