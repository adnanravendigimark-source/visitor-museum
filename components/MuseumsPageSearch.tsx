"use client";

import { useRouter } from "next/navigation";
import MuseumSearchBar, { type MuseumSuggestion } from "./MuseumSearchBar";

// Thin client wrapper around MuseumSearchBar for the /museums page itself:
// changing a filter here shouldn't do a full navigation (MuseumsGrid is
// already mounted on this same page and only reads the URL once, on
// mount — a client-side query-only navigation wouldn't remount it, so the
// grid would silently stop reacting to further changes). Instead this
// dispatches the `museumSearch` window event MuseumsGrid already listens
// for, so results update instantly, and separately keeps the URL in sync
// with router.replace so the filtered view is still shareable/bookmarkable.
export default function MuseumsPageSearch({
  countries,
  museums = [],
}: {
  countries: { country: string; cities: string[] }[];
  museums?: MuseumSuggestion[];
}) {
  const router = useRouter();

  function handleSearch({ query, country, city }: { query: string; country: string; city: string }) {
    window.dispatchEvent(new CustomEvent("museumSearch", { detail: { query, country, city } }));

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    router.replace(`/museums${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return <MuseumSearchBar countries={countries} theme="surface" onSearch={handleSearch} museums={museums} />;
}
