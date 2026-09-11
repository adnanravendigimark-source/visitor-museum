"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";
import { SearchIcon } from "./icons";

export interface MuseumSearchEntry {
  slug: string;
  name: string;
  city: string;
  country: string;
  cardImage?: string;
  cardImageAlt?: string;
}

// Small header search: a single icon button that expands into a text
// input with a live type-ahead dropdown underneath, filtered client-side
// against the museum list already fetched server-side by Header.tsx (only
// ~16 rows, so no separate search API/DB round trip is needed). Clicking a
// result (mouse or keyboard) goes straight to that museum's page; pressing
// Enter with no result highlighted falls back to the full filtered list on
// /museums.
export default function HeaderSearch({
  museums,
  defaultOpen = false,
}: {
  museums: MuseumSearchEntry[];
  // Skips the icon-button step and shows the input immediately, full width
  // — used in MobileNav's slide-down panel, where there's no room saved by
  // starting collapsed and an extra tap to reveal it would just be friction.
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(defaultOpen);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(defaultOpen);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [defaultOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return museums
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [museums, query]);

  // Keep the keyboard-highlighted row in range whenever the result set
  // changes (new keystroke, etc.) instead of pointing at a stale index.
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  function goTo(slug: string) {
    router.push(`/${slug}`);
    setOpen(defaultOpen);
    setQuery("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      goTo(results[activeIndex].slug);
    } else if (results.length === 1) {
      goTo(results[0].slug);
    } else if (query.trim()) {
      router.push(`/museums?q=${encodeURIComponent(query.trim())}`);
      setOpen(defaultOpen);
      setQuery("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  const showDropdown = query.trim().length > 0;
  const widthClass = defaultOpen
    ? "w-full"
    : "w-40 focus:w-56 sm:w-48 sm:focus:w-64";

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search museums, cities…"
              autoComplete="off"
              className={`${widthClass} rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-xs text-[#1F2429] shadow-sm transition-all focus:border-[#184E3A] focus:outline-none focus:ring-1 focus:ring-[#184E3A]`}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-[#184E3A]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3 w-3">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:right-auto sm:w-80">
              {results.length > 0 ? (
                <>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    Museums
                  </p>
                  <div className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
                    {results.map((m, idx) => (
                      <Link
                        key={m.slug}
                        href={`/${m.slug}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => {
                          setOpen(defaultOpen);
                          setQuery("");
                        }}
                        className={`flex items-center gap-3 border-l-2 px-3.5 py-2.5 text-xs transition ${
                          idx === activeIndex
                            ? "border-[#184E3A] bg-[#F4F7F5]"
                            : "border-transparent hover:border-[#184E3A] hover:bg-[#F4F7F5]"
                        }`}
                      >
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {m.cardImage && (
                            <SafeImage src={m.cardImage} alt={m.cardImageAlt || m.name} fill sizes="40px" className="object-cover" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-[#1F2429]">{m.name}</span>
                          <span className="block truncate text-[11px] text-gray-400">
                            {m.city}, {m.country}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/museums?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => {
                      setOpen(defaultOpen);
                      setQuery("");
                    }}
                    className="block border-t border-gray-50 px-4 py-2.5 text-center text-[11px] font-semibold text-[#184E3A] hover:bg-[#F4F7F5]"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo; →
                  </Link>
                </>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-gray-500">
                  No museums found for &ldquo;{query.trim()}&rdquo;.
                </div>
              )}
            </div>
          )}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search museums"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#2A302F] transition hover:bg-gray-100 hover:text-[#184E3A]"
        >
          <SearchIcon className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
}
