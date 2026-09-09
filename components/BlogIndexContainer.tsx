"use client";

import { useState, useMemo } from "react";
import BlogSearchGrid from "./BlogSearchGrid";
import BlogIndexSidebar from "./BlogIndexSidebar";
import type { Post } from "@/lib/posts";

export default function BlogIndexContainer({
  posts,
  emptyStateText,
  ctaHeading,
  ctaBody,
  ctaButtonText,
  ctaButtonHref,
}: {
  posts: Post[];
  emptyStateText: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Compute category counts dynamically
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      const cat = post.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [posts]);

  return (
    <div id="articles-section" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
      <div>
        <div className="mb-6">
          <h2 className="font-blog-display text-2xl font-bold text-[#112338] sm:text-3xl">Latest Guides</h2>
          <p className="mt-1.5 text-xs text-[#556476] sm:text-sm">
            Expert tips, travel guides and everything you need to know about visiting museums and attractions worldwide.
          </p>
        </div>

        <div>
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-sm text-[#718096]">
              {emptyStateText}
            </p>
          ) : (
            <BlogSearchGrid
              posts={posts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>

      <div className="mt-12 lg:mt-0">
        <BlogIndexSidebar
          posts={posts}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          ctaHeading={ctaHeading}
          ctaBody={ctaBody}
          ctaButtonText={ctaButtonText}
          ctaButtonHref={ctaButtonHref}
        />
      </div>
    </div>
  );
}
