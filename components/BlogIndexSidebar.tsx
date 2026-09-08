"use client";

import Link from "next/link";
import SafeImage from "./SafeImage";
import { TicketIcon, CalendarIcon, SearchIcon } from "./icons";
import type { Post } from "@/lib/posts";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogIndexSidebar({
  posts,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  ctaHeading = "Ready to Plan Your Museum Visit?",
  ctaBody = "Compare skip-the-line tickets and guided tours in one place.",
  ctaButtonText = "Browse Museum Tickets →",
  ctaButtonHref = "/",
}: {
  posts: Post[];
  categories: { name: string; count: number }[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
}) {
  const popular = posts.slice(0, 5);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {/* Search Widget */}
      <div className="flex rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-sm focus-within:border-[#112338]">
        <input
          type="text"
          value={searchQuery || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search guides..."
          className="w-full bg-transparent px-3.5 py-2.5 text-xs text-[#112338] placeholder-[#718096] focus:outline-none"
        />
        <button
          type="button"
          aria-label="Search"
          className="flex items-center justify-center bg-[#112338] px-3.5 text-white transition hover:bg-[#1a3452]"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm">
          <p className="font-serif text-base font-bold text-[#112338]">Categories</p>
          <div className="mt-3.5 space-y-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(isSelected ? "All" : cat.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-[#FAF8F5] text-[#B85D3E] font-bold border border-[#ECE8DE]"
                      : "text-[#556476] hover:bg-[#FAF8F5] hover:text-[#112338]"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FAF8F5] px-1.5 text-[10px] font-bold text-[#112338] border border-[#ECE8DE]">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Articles Widget */}
      {popular.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm">
          <p className="font-serif text-base font-bold text-[#112338]">Popular Guides</p>
          <div className="mt-4 space-y-3.5">
            {popular.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-3"
              >
                <div className="relative h-13 w-16 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-[#0B1B2B]">
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
                  <p className="line-clamp-2 text-xs font-bold leading-snug text-[#112338] transition-colors group-hover:text-[#B85D3E]">
                    {post.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#718096] font-medium">
                    <CalendarIcon className="h-3 w-3 text-[#B85D3E]" />
                    {formatDate(post.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Book Your Tickets Promo Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1B2B] p-6 text-center text-white shadow-md">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/15 shadow-sm">
          <TicketIcon className="h-5 w-5" />
        </div>
        <p className="mt-3.5 font-serif text-base font-bold text-white">{ctaHeading}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">{ctaBody}</p>
        <a
          href={ctaButtonHref}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-[#112338] shadow-sm transition hover:bg-gray-100 hover:scale-[1.02]"
        >
          {ctaButtonText}
        </a>
      </div>
    </aside>
  );
}
