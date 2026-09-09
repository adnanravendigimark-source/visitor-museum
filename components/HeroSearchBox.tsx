"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("loc", location.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `/#museums?${queryString}` : "/#museums";

    if (typeof window !== "undefined" && window.location.pathname === "/") {
      const el = document.getElementById("museums");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      window.history.pushState(null, "", targetUrl);
      window.dispatchEvent(
        new CustomEvent("museumSearch", { detail: { query, location } })
      );
    } else {
      router.push(targetUrl);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-2xl p-2 sm:p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-gray-100/90 max-w-2xl gap-2 transition-all focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
    >
      {/* Search Input */}
      <div className="flex items-center flex-1 px-3.5 py-1.5">
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 mr-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search museums, cities or countries..."
          className="w-full text-xs sm:text-[13.5px] text-[#1F2429] placeholder-gray-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-7 bg-gray-200" />

      {/* Location Dropdown */}
      <div className="flex items-center px-3.5 py-1.5 border-t sm:border-t-0 border-gray-100">
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <div className="relative">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="appearance-none text-xs sm:text-[13.5px] text-[#1F2429] font-medium bg-transparent focus:outline-none cursor-pointer pr-5 py-0.5"
          >
            <option value="">All Locations</option>
            <option value="Paris">Paris, France</option>
            <option value="Vatican City">Vatican City</option>
            <option value="Florence">Florence, Italy</option>
            <option value="Zurich">Zurich, Switzerland</option>
            <option value="London">London, UK</option>
            <option value="Amsterdam">Amsterdam, Netherlands</option>
            <option value="Stockholm">Stockholm, Sweden</option>
            <option value="Brussels">Brussels, Belgium</option>
          </select>
          <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
            ▼
          </span>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="rounded-xl bg-[#1D4A43] hover:bg-[#153833] active:scale-[0.99] text-white px-7 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 shadow-sm"
      >
        Search
      </button>
    </form>
  );
}
