"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";
import { GlobeIcon, MapPinIcon, SearchIcon, ChevronDownIcon } from "./icons";

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

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || museums.length === 0) return [];
    return museums
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [museums, query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  function selectSuggestion(m: MuseumSuggestion) {
    setSuggestOpen(false);
    setQuery("");
    router.push(`/${m.slug}`);
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
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
      return;
    }
    setSuggestOpen(false);
    if (onSearch) {
      onSearch({ query, country, city });
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    router.push(`/museums${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const containerClass =
    theme === "light"
      ? "flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100/90 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5 sm:pl-4 sm:pr-1.5"
      : "flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5 sm:pl-4 sm:pr-1.5";

  return (
    <form onSubmit={handleSubmit} className={containerClass}>
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
                className="w-full cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-normal text-gray-500 focus:outline-none"
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
                disabled={!country}
                className="w-full cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-normal text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400"
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
        <SearchIcon className="h-4 w-4 shrink-0 text-gray-700" />
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
          className="w-full bg-transparent text-[12.5px] font-normal text-[#1F2429] placeholder:text-gray-400 focus:outline-none"
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
        className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#184E3A] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[#123b2c] hover:shadow-md"
      >
        <span>Search</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </button>
    </form>
  );
}
