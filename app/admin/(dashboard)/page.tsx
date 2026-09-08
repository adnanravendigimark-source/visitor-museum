import Link from "next/link";
import { getMuseums } from "@/lib/museums";
import { getPosts } from "@/lib/posts";
import { getSession } from "@/lib/session";
import type { PageKey } from "@/lib/pageAccess";
import { HomeIcon, TicketStackIcon, DocumentIcon, ShieldIcon, GlobeIcon, InfoIcon, MailIcon, SearchIcon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const cards: { href: string; label: string; desc: string; icon: typeof HomeIcon; pageKey: PageKey }[] = [
  { href: "/admin/homepage", label: "Homepage Content", desc: "Hero headline, subheading, photo, and site-wide SEO.", icon: HomeIcon, pageKey: "homepage" },
  { href: "/admin/museums", label: "Museums & Attractions", desc: "Every museum page, its tickets, FAQs, location, and SEO.", icon: TicketStackIcon, pageKey: "museums" },
  { href: "/admin/posts", label: "Blog Posts", desc: "Articles shown on /blog, including full SEO per post.", icon: DocumentIcon, pageKey: "posts" },
  { href: "/admin/privacy", label: "Privacy Policy", desc: "Legal page shown at /privacy-policy, linked from the footer.", icon: ShieldIcon, pageKey: "privacy" },
  { href: "/admin/about", label: "About Page", desc: "Every section of /about, plus its SEO.", icon: InfoIcon, pageKey: "about" },
  { href: "/admin/contact", label: "Contact Page", desc: "Every section of /contact, plus its SEO.", icon: MailIcon, pageKey: "contact" },
  { href: "/admin/pages", label: "Blog Page SEO", desc: "SEO fields for the /blog listing page.", icon: GlobeIcon, pageKey: "pages" },
];

const indexingCard = {
  href: "/admin/indexing",
  label: "Indexing",
  desc: "Search Engine Indexing & Link Following for every page, in one place.",
  icon: SearchIcon,
};

export default async function AdminDashboardPage() {
  const museums = await getMuseums();
  const posts = await getPosts();

  const session = await getSession();
  const isAdmin = session?.role === "admin";
  const pages = session?.pages || [];
  const visibleCards = cards.filter((c) => isAdmin || pages.includes(c.pageKey));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Welcome back 👋</h1>
      <p className="mt-1 text-sm text-stone-600">
        Edit the live site's content below — changes save straight to the site, no developer needed.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-3xl font-bold text-stone-900">{museums.length}</p>
          <p className="text-sm text-stone-500">Museums &amp; attractions live</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-3xl font-bold text-stone-900">{posts.length}</p>
          <p className="text-sm text-stone-500">Blog posts published</p>
        </div>
      </div>

      <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-stone-400">Manage content</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-canal-orange/40 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-canal-orange/10 group-hover:text-canal-orange">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-stone-900">{card.label}</span>
                <span className="mt-0.5 block text-sm text-stone-500">{card.desc}</span>
              </span>
            </Link>
          );
        })}
        {visibleCards.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 sm:col-span-2">
            You don't have access to any sections yet — ask an admin to grant you page access from
            Users.
          </p>
        )}
      </div>

      {isAdmin && (
        <>
          <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-stone-400">Admin only</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Link
              href={indexingCard.href}
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-canal-orange/40 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-canal-orange/10 group-hover:text-canal-orange">
                <indexingCard.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-stone-900">{indexingCard.label}</span>
                <span className="mt-0.5 block text-sm text-stone-500">{indexingCard.desc}</span>
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
