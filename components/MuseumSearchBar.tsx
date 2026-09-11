"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";
import { GlobeIcon, MapPinIcon, SearchIcon, ChevronDownIcon } from "./icons";

// A small two-tone rotating ring, built from scratch for this search bar
// rather than dropped in from a component library — one dim full circle
// plus one solid quarter-arc on top, spun with Tailwind's animate-spin.
// Uses currentColor so it can sit inside the green button (white) or next
// to the input text (dark) without a separate color prop.
function SearchSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export interface MuseumSuggestion {
  slug: string;
  name: string;
  city: string;
  country: string;
  cardImage?: string;
  cardImageAlt?: string;
}

export default function MuseumSearchBar({
  countries,
  theme = "light",
  onSearch,
  museums = [],
}: {
  countries: { country: string; cities: string[] }[];
  theme?: "light" | "surface";
  onSearch?: (value: { query: string; country: string; city: string }) => void;
  museums?: MuseumSuggestion[];
}) {
  const router = useRouter();
  // Tracks the gap between clicking Search (or a suggestion) and the
  // destination page actually finishing its navigation — router.push()
  // itself returns instantly, but the real page (a live DB-backed museum
  // page, or /museums) can take a moment to fetch and render, and until
  // now nothing showed that anything was happening at all. Wrapping every
  // navigation in a transition gives us that gap as `isPending`.
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cityOptions = useMemo(
    () => countries.find((c) => c.country === country)?.cities || [],
    [countries, country]
  );

  function handleCountryChange(value: string) {
    setCountry(value);
    setCity("");
  }

  useEffect(() => {
    if (!onSearch) return;
    const handle = setTimeout(() => {
      onSearch({ query, country, city });
    }, 150);
    return () => clearTimeout(handle);
  }, [query, country, city]);

  function matchesQuery(m: MuseumSuggestion, q: string) {
    return (
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q)
    );
  }

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || museums.length === 0) return [];
    return museums.filter((m) => matchesQuery(m, q)).slice(0, 6);
  }, [museums, query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Warms the Router Cache for every museum currently showing as a
  // suggestion, as soon as it appears — by the time someone actually
  // clicks one (or it's the sole match and they hit Search), Next.js may
  // already have that page's payload ready instead of starting the fetch
  // from a standing start. Cheap: at most 6 pages, and prefetch is a
  // no-op if one's already cached.
  useEffect(() => {
    for (const m of suggestions) {
      router.prefetch(`/${m.slug}`);
    }
  }, [suggestions, router]);

  // /museums is the fallback destination for every "not exactly one match"
  // case below — worth having ready before the visitor ever presses
  // Search.
  useEffect(() => {
    router.prefetch("/museums");
  }, [router]);

  function selectSuggestion(m: MuseumSuggestion) {
    if (isPending) return;
    setSuggestOpen(false);
    setQuery("");
    startTransition(() => {
      router.push(`/${m.slug}`);
    });
  }

  function handleQueryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
      return;
    }
    setSuggestOpen(false);
    if (onSearch) {
      // /museums page's own filter bar — already live-filtering in place as
      // you type/select (see the debounced effect above), so Search here
      // just re-confirms the current values rather than navigating.
      onSearch({ query, country, city });
      return;
    }

    const q = query.trim();

    // Free-text search with no country/city narrowing it down: if it
    // pins down exactly one museum, jump straight there — no /museums stop
    // in between. Anything else (zero matches, or several) goes to
    // /museums?q=..., where the grid either lists the matches or, for zero,
    // shows a "not found" message plus the full catalog as a fallback (see
    // MuseumsGrid.tsx) — a single page load either way, rather than the
    // extra round trip a fake-slug 404 lookup used to cost.
    if (q && museums.length > 0 && !country && !city) {
      const matches = museums.filter((m) => matchesQuery(m, q.toLowerCase()));
      if (matches.length === 1) {
        startTransition(() => router.push(`/${matches[0].slug}`));
        return;
      }
    }

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    startTransition(() => {
      router.push(`/museums${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  const containerClass =
    (theme === "light"
      ? "flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100/90 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5 sm:pl-4 sm:pr-1.5"
      : "flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5 sm:pl-4 sm:pr-1.5") +
    " transition-opacity duration-200" +
    (isPending ? " opacity-70" : "");

  return (
    <form onSubmit={handleSubmit} className={containerClass} aria-busy={isPending}>
      {/* Screen-reader-only status announcement — the visual cues below
          (spinner icon, "Searching…" button label) are the primary signal,
          this just mirrors it for assistive tech. */}
      <span role="status" className="sr-only">
        {isPending ? "Searching…" : ""}
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-0 sm:shrink-0">
        {/* Country Selector */}
        <div className="relative flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:py-1 sm:pl-1 sm:pr-3">
          <GlobeIcon className="h-4 w-4 shrink-0 text-gray-700" />
          <div className="min-w-0 flex-1 text-left">
            <span className="block text-[11px] font-semibold leading-none text-gray-800">
              Country
            </span>
            <div className="relative mt-0.5 flex items-center">
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={isPending}
                className="w-full cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-normal text-gray-500 focus:outline-none disabled:cursor-wait disabled:opacity-60"
                aria-label="Country"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <span className="hidden h-7 w-px shrink-0 bg-gray-200 sm:block" />

        {/* City Selector */}
        <div className="relative flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:py-1 sm:pl-3 sm:pr-3">
          <MapPinIcon className="h-4 w-4 shrink-0 text-gray-700" />
          <div className="min-w-0 flex-1 text-left">
            <span className="block text-[11px] font-semibold leading-none text-gray-800">
              City
            </span>
            <div className="relative mt-0.5 flex items-center">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country || isPending}
                className="w-full cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-normal text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-60"
                aria-label="City"
              >
                <option value="">{country ? "Select city" : "Select city"}</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <span className="hidden h-7 w-px shrink-0 bg-gray-200 sm:block" />

      {/* Query input & type-ahead search */}
      <div className="relative flex flex-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:py-1 sm:pl-3 sm:pr-2">
        {/* Swaps to the spinner the instant a navigation kicks off, right
            next to the text that was typed — the most direct "yes, this is
            doing something" signal, since that's where the eye already is. */}
        {isPending ? (
          <SearchSpinner className="h-4 w-4 shrink-0 text-[#184E3A]" />
        ) : (
          <SearchIcon className="h-4 w-4 shrink-0 text-gray-700" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestOpen(true);
          }}
          onFocus={() => setSuggestOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setSuggestOpen(false), 120);
          }}
          onKeyDown={handleQueryKeyDown}
          placeholder="Search museums, e.g. Louvre, modern art, history..."
          autoComplete="off"
          disabled={isPending}
          className="w-full bg-transparent text-[12.5px] font-normal text-[#1F2429] placeholder:text-gray-400 focus:outline-none disabled:cursor-wait"
          aria-label="Search museums"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            className="shrink-0 rounded-full p-0.5 text-gray-400 hover:text-[#184E3A]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {suggestOpen && suggestions.length > 0 && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              if (blurTimer.current) clearTimeout(blurTimer.current);
            }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-xl"
          >
            <div className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
              {suggestions.map((m, idx) => (
                <button
                  key={m.slug}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => selectSuggestion(m)}
                  className={`flex w-full items-center gap-3 border-l-2 px-3.5 py-2.5 text-left text-xs transition ${
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
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={`group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all ${
          isPending ? "cursor-wait bg-[#123b2c]" : "bg-[#184E3A] hover:bg-[#123b2c] hover:shadow-md"
        }`}
      >
        {isPending ? (
          <>
            <SearchSpinner className="h-3.5 w-3.5" />
            <span>Searching…</span>
          </>
        ) : (
          <>
            <span>Search</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </>
        )}
      </button>
    </form>
  );
}
