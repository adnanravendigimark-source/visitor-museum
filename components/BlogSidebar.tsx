"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import TableOfContents from "./TableOfContents";
import { CalendarIcon, SearchIcon, TicketIcon } from "./icons";
import type { Post } from "@/lib/posts";
import type { TocItem } from "@/lib/tableOfContents";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogSidebar({
  popularPosts,
  toc,
  tocLabel = "IN THIS GUIDE",
  relatedHeading = "POPULAR GUIDES",
  compareLinkText = "Compare Tickets & Tours →",
  compareLinkHref = "/",
  promoHeading = "Compare Museum Tickets & Tours",
  promoBody = "Find the best ticket options, opening hours and prices in one place.",
  recommendedBadge,
}: {
  slug: string;
  popularPosts: Post[];
  toc: TocItem[];
  tocLabel?: string;
  relatedHeading?: string;
  compareLinkText?: string;
  compareLinkHref?: string;
  promoHeading?: string;
  promoBody?: string;
  recommendedBadge?: string;
}) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/blog?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  const popular = popularPosts.slice(0, 4);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-sm focus-within:border-[#2D903A]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides..."
          className="w-full bg-transparent px-3.5 py-2.5 text-xs text-[#2A302F] placeholder-[#718096] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center bg-[#2D903A] px-3.5 text-white transition hover:bg-[#257630]"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </form>

      {/* Table of Contents */}
      <TableOfContents items={toc} label={tocLabel} />

      {/* Popular Articles */}
      {popular.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm">
          <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#2A302F]">
            {relatedHeading}
          </p>
          <div className="mt-4 space-y-3.5">
            {popular.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.slug}`}
                className="group flex items-center gap-3"
              >
                <div className="relative h-13 w-16 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                  <SafeImage
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    quality={65}
                    sizes="80px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold leading-snug text-[#2A302F] transition-colors group-hover:text-[#2D903A]">
                    {post.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#718096] font-medium">
                    <CalendarIcon className="h-3 w-3 text-[#2D903A]" />
                    {formatDate(post.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Compare Tickets Promo Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1B2B] p-6 text-center text-white shadow-md">
        {recommendedBadge && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
            {recommendedBadge}
          </span>
        )}
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/15 shadow-sm">
          <TicketIcon className="h-5 w-5" />
        </div>
        <p className="mt-3.5 font-serif text-base font-bold text-white">
          {promoHeading}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
          {promoBody}
        </p>
        <a
          href={compareLinkHref}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-[#112338] shadow-sm transition hover:bg-gray-100 hover:scale-[1.02]"
        >
          {compareLinkText}
        </a>
      </div>

      {/* Newsletter Card */}
      <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm">
        <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#112338]">
          NEWSLETTER
        </p>
        <p className="mt-2 text-xs text-[#556476] leading-relaxed">
          Get travel tips, guides and exclusive deals straight to your inbox.
        </p>
        {subscribed ? (
          <p className="mt-3 text-xs font-semibold text-[#B85D3E]">✓ Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-3 space-y-2">
            <div className="flex rounded-lg border border-[#CBD5E1] bg-white overflow-hidden focus-within:border-[#112338]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full bg-transparent px-3 py-2 text-xs text-[#112338] placeholder-[#718096] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex items-center justify-center bg-[#112338] px-3 text-white transition hover:bg-[#1a3452]"
              >
                →
              </button>
            </div>
            <label className="flex items-start gap-1.5 text-[11px] text-[#556476] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-[#CBD5E1] text-[#112338] focus:ring-[#112338]"
              />
              <span>I agree to receive emails and updates.</span>
            </label>
          </form>
        )}
      </div>
    </aside>
  );
}
