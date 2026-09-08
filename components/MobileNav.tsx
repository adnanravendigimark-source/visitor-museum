"use client";

import { useState } from "react";
import Link from "next/link";
import { NavLink } from "@/lib/homepage";

export default function MobileNav({
  links,
  ctaText,
  ctaHref,
}: {
  links: NavLink[];
  ctaText: string;
  ctaHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-warmstone-200 bg-cream-50 text-charcoal-800 transition hover:bg-warmstone-100"
      >
        {open ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-xl font-bold">☰</span>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-warmstone-200 bg-cream-100 p-6 shadow-2xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-bold text-charcoal-800 transition hover:text-olive-700"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-olive-700 py-3 text-center text-sm font-bold uppercase tracking-wider text-cream-100 shadow-md transition hover:bg-olive-800"
            >
              {ctaText}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
