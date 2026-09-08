"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/homepage";

export default function HeaderNav({ links }: { links?: NavLink[] }) {
  const pathname = usePathname();

  const defaultLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const navLinks = links && links.length ? links : defaultLinks;

  return (
    <nav className="hidden items-center gap-7 lg:flex">
      {navLinks.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href) && link.href !== "/#tours";

        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`relative py-1 text-[13px] font-medium transition-colors ${
              isActive
                ? "text-[#112338] font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-[#112338]"
                : "text-[#4A5568] hover:text-[#112338]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
