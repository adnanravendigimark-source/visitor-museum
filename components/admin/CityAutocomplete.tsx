"use client";

import { useEffect, useRef, useState } from "react";

export interface CitySelection {
  city: string;
  country: string;
  countryCode: string;
  admin1?: string;
}

// Ported from the attraction-travel-news sibling repo's identical
// components/CityAutocomplete.tsx — same city/country search UX (debounced
// client-side on top of the API route's own 2-character minimum), backed
// by the same /api/admin/geo/cities endpoint pattern (see lib/geo.ts).
// Used by MuseumTourForm.tsx's City field: picking a result here sets both
// the tour's city AND country in one action, so they can never drift out
// of sync with each other.
export default function CityAutocomplete({
  initialQuery = "",
  placeholder = "Search for a city…",
  onSelect,
  className = "",
  inputClassName = "",
}: {
  initialQuery?: string;
  placeholder?: string;
  onSelect: (selection: CitySelection) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CitySelection[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/geo/cities?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => ({}));
        setResults(res.ok ? data.results || [] : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(r: CitySelection) {
    const label = r.admin1 ? `${r.city} (${r.admin1}), ${r.country}` : `${r.city}, ${r.country}`;
    setQuery(label);
    setOpen(false);
    setResults([]);
    onSelect(r);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={
          inputClassName ||
          "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
        }
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg">
          {loading ? (
            <p className="px-3 py-2 text-xs text-stone-400">Searching global cities…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-stone-400">No matching cities found.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.city}-${r.country}-${r.admin1 || ""}-${i}`}
                type="button"
                onClick={() => handleSelect(r)}
                className="block w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-stone-50 cursor-pointer"
              >
                <span className="font-semibold">{r.city}</span>
                {r.admin1 && <span className="font-normal text-stone-500"> ({r.admin1})</span>}
                <span className="text-stone-400">, {r.country}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
