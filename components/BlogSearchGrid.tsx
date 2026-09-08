"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import { CalendarIcon, ClockPayIcon } from "./icons";
import type { Post } from "@/lib/posts";

const PAGE_SIZE = 9;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogSearchGrid({
  posts,
  selectedCategory,
  onSelectCategory,
  searchQuery = "",
}: {
  posts: Post[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
}) {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter by category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat =
        !selectedCategory ||
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Sort
  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    if (sortOrder === "oldest") {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return list;
  }, [filteredPosts, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sortedPosts.slice(start, start + PAGE_SIZE);

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
    if (typeof window !== "undefined") {
      const el = document.getElementById("articles-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  return (
    <div>
      {/* Header bar: Count & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8ECEF] pb-4">
        <p className="text-xs font-medium text-[#556476]">
          Showing {sortedPosts.length === 0 ? 0 : start + 1} –{" "}
          {Math.min(start + PAGE_SIZE, sortedPosts.length)} of {sortedPosts.length} articles
          {selectedCategory && selectedCategory !== "All" && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#FAF8F5] border border-[#ECE8DE] px-2 py-0.5 text-[11px] font-semibold text-[#B85D3E]">
              {selectedCategory}
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory("All")}
                className="hover:text-red-700 ml-1"
                aria-label="Clear filter"
              >
                ×
              </button>
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="sr-only">
            Sort articles
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="appearance-none rounded-lg border border-[#CBD5E1] bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-[#112338] shadow-sm transition hover:border-[#112338] focus:border-[#112338] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#718096]">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {sortedPosts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-sm text-[#718096]">
          No articles found matching your criteria.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <SafeImage
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  quality={70}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* Category Pill */}
                <div className="mb-2.5">
                  <span className="inline-block rounded-md bg-[#FAF8F5] border border-[#ECE8DE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B85D3E]">
                    {post.category}
                  </span>
                </div>

                {/* Date and Read Time */}
                <div className="flex items-center gap-3 text-[11px] font-medium text-[#718096]">
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#B85D3E]" />
                    {formatDate(post.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockPayIcon className="h-3.5 w-3.5 text-[#B85D3E]" />
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-2.5 line-clamp-2 font-serif text-[15px] font-bold leading-snug text-[#112338] transition-colors group-hover:text-[#B85D3E]">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-[#556476]">
                  {post.excerpt}
                </p>

                {/* Read More link */}
                <div className="mt-4 pt-2 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#112338] transition group-hover:text-[#B85D3E]">
                    Read More <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#112338] transition hover:border-[#112338] disabled:opacity-30 disabled:hover:border-[#CBD5E1]"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              totalPages > 6 &&
              p !== 1 &&
              p !== totalPages &&
              Math.abs(p - currentPage) > 1
            ) {
              if (p === 2 || p === totalPages - 1) {
                return (
                  <span key={p} className="px-1 text-xs text-[#718096]">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition ${
                  p === currentPage
                    ? "bg-[#112338] text-white shadow-sm"
                    : "border border-[#CBD5E1] bg-white text-[#112338] hover:border-[#112338]"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-[#112338] transition hover:border-[#112338] disabled:opacity-30 disabled:hover:border-[#CBD5E1]"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
