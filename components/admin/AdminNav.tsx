"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PageKey } from "@/lib/pageAccess";
import {
  GridIcon,
  HomeIcon,
  TicketStackIcon,
  StarBadgeIcon,
  PinIcon,
  DocumentIcon,
  ShieldIcon,
  GlobeIcon,
  InfoIcon,
  MailIcon,
  SearchIcon,
  UsersIcon,
  LockIcon,
} from "./icons";

const baseNavItems: { href: string; label: string; icon: typeof GridIcon; pageKey?: PageKey }[] = [
  { href: "/admin", label: "Dashboard", icon: GridIcon },
  { href: "/admin/homepage", label: "Homepage", icon: HomeIcon, pageKey: "homepage" },
  { href: "/admin/museums", label: "Museums & Attractions", icon: TicketStackIcon, pageKey: "museums" },
  { href: "/admin/museums/tours", label: "Tours & Tickets", icon: StarBadgeIcon, pageKey: "museums" },
  { href: "/admin/attractions", label: "Other Attractions", icon: PinIcon, pageKey: "museums" },
  { href: "/admin/posts", label: "Blog Posts", icon: DocumentIcon, pageKey: "posts" },
  { href: "/admin/privacy", label: "Privacy Policy", icon: ShieldIcon, pageKey: "privacy" },
  { href: "/admin/about", label: "About Page", icon: InfoIcon, pageKey: "about" },
  { href: "/admin/contact", label: "Contact Page", icon: MailIcon, pageKey: "contact" },
  { href: "/admin/pages", label: "Blog Page SEO", icon: GlobeIcon, pageKey: "pages" },
];

// Admin-only nav items — appended after the per-section items, not gated
// by any PAGE_KEY an editor could be granted (Indexing spans every section
// at once; Users manages login credentials).
const indexingNavItem = { href: "/admin/indexing", label: "Indexing", icon: SearchIcon };
const usersNavItem = { href: "/admin/users", label: "Users", icon: UsersIcon };
// Shown to everyone — each user can only change their own password.
const accountNavItem = { href: "/admin/account", label: "My Account", icon: LockIcon };

function visibleNavItems(isAdmin: boolean, pages: PageKey[]) {
  const items = baseNavItems.filter((item) => !item.pageKey || isAdmin || pages.includes(item.pageKey));
  const adminItems = isAdmin ? [indexingNavItem, usersNavItem] : [];
  return [...items, ...adminItems, accountNavItem];
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ isAdmin, pages }: { isAdmin: boolean; pages: PageKey[] }) {
  const pathname = usePathname();
  const navItems = visibleNavItems(isAdmin, pages);
  return (
    <nav className="flex-1 space-y-0.5 px-3 py-6">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active
                ? "bg-sage-500/15 text-sage-400"
                : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-sage-400" : "text-white/40"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ isAdmin, pages }: { isAdmin: boolean; pages: PageKey[] }) {
  const pathname = usePathname();
  const navItems = visibleNavItems(isAdmin, pages);
  return (
    <nav className="flex gap-1.5 overflow-x-auto border-b border-stone-900/10 bg-white px-4 py-2 sm:hidden">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? "bg-canal-primary text-white" : "text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
