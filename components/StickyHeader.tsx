"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Same transparent-over-hero → white-on-scroll pattern as the pena-palace /
// amsterdam-boat-tours reference sites: while at the top of the homepage
// (where the full-bleed Hero image sits directly underneath), the header is
// transparent and pulled up with a negative margin so the hero photo runs
// edge-to-edge behind it; past a small scroll threshold it becomes a solid,
// blurred bar.
//
// Every other page (museum pages, blog, about, contact...) doesn't have a
// full-bleed hero starting at y=0 the way the homepage does, so the header
// stays solid there from the very first paint — never transparent — to
// avoid overlapping and clipping the top of that page's own content.
export default function StickyHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-100 bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-md"
          : "-mb-20 border-0 bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
