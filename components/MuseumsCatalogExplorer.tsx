"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import type { Museum } from "@/lib/museums";
import { GlobeIcon, MapPinIcon, ChevronDownIcon } from "./icons";

interface MuseumsCatalogExplorerProps {
  initialMuseums: Museum[];
  countries: { country: string; cities: string[] }[];
}

export default function MuseumsCatalogExplorer({
  initialMuseums,
  countries,
}: MuseumsCatalogExplorerProps) {
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Listen to search params or custom event from Hero Search Bar
  useEffect(() => {
    function handleSearchEvent(e: Event) {
      const custom = e as CustomEvent<{ query?: string; country?: string; city?: string }>;
      if (custom.detail) {
        if (custom.detail.query !== undefined) setSearchQuery(custom.detail.query);
        if (custom.detail.country !== undefined) {
          setSelectedCountry(custom.detail.country);
          setSelectedCity(custom.detail.city || "");
        }
      }
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const country = params.get("country") || "";
      const city = params.get("city") || "";
      if (q) setSearchQuery(q);
      if (country) {
        setSelectedCountry(country);
        if (city) setSelectedCity(city);
      }
    }

    window.addEventListener("museumSearch", handleSearchEvent);
    return () => window.removeEventListener("museumSearch", handleSearchEvent);
  }, []);

  // Cascading city list
  const availableCities = useMemo(() => {
    if (!selectedCountry) {
      return Array.from(new Set(initialMuseums.map((m) => m.city).filter(Boolean))).sort();
    }
    return countries.find((c) => c.country.toLowerCase() === selectedCountry.toLowerCase())?.cities || [];
  }, [countries, selectedCountry, initialMuseums]);

  // Categories with counts dynamically computed
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialMuseums.forEach((m) => {
      const cat = m.category || "Art Museums";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [initialMuseums]);

  const categoriesList = useMemo(() => {
    const preferredOrder = [
      "Art Museums",
      "History Museums",
      "Science & Technology",
      "Special Collections",
      "Modern Art",
    ];
    const presentCategories = Array.from(
      new Set([...preferredOrder, ...initialMuseums.map((m) => m.category || "Art Museums")])
    );
    return presentCategories
      .filter((cat) => (categoryCounts[cat] || 0) > 0)
      .map((cat) => ({
        label: cat,
        key: cat,
        count: categoryCounts[cat] || 0,
      }));
  }, [initialMuseums, categoryCounts]);

  const popularFeatureOptions = [
    { label: "Skip-the-Line Tickets", key: "Skip-the-line" },
    { label: "Guided Tours", key: "Guided tour" },
    { label: "Audio Guide", key: "Audio guide" },
    { label: "Family Friendly", key: "Family Friendly" },
  ];

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleFeature(feat: string) {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function clearAllFilters() {
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedCategories([]);
    setSelectedFeatures([]);
    setSearchQuery("");
  }

  const activeFiltersCount =
    (selectedCountry ? 1 : 0) +
    (selectedCity ? 1 : 0) +
    selectedCategories.length +
    selectedFeatures.length +
    (searchQuery ? 1 : 0);

  // Filtered and sorted museums
  const filteredMuseums = useMemo(() => {
    return initialMuseums
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            m.name.toLowerCase().includes(q) ||
            m.city.toLowerCase().includes(q) ||
            m.country.toLowerCase().includes(q) ||
            m.cardTagline.toLowerCase().includes(q) ||
            (m.category && m.category.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Country filter
        if (selectedCountry && m.country.toLowerCase() !== selectedCountry.toLowerCase()) {
          return false;
        }

        // City filter
        if (selectedCity && m.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }

        // Category filter
        if (selectedCategories.length > 0) {
          const cat = m.category || "Art Museums";
          if (!selectedCategories.includes(cat)) {
            return false;
          }
        }

        // Feature filter (Popular options)
        if (selectedFeatures.length > 0) {
          const features = m.featuresList || [];
          const hasAll = selectedFeatures.every((f) =>
            features.some((item) => item.toLowerCase().includes(f.toLowerCase())) ||
            (f.toLowerCase() === "family friendly" && (m.cardBadge === "Family Friendly" || features.some(item => item.toLowerCase().includes("family"))))
          );
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.sortOrder - b.sortOrder;
        }
        if (sortBy === "rating") {
          return (b.rating || 4.7) - (a.rating || 4.7);
        }
        if (sortBy === "price-low") {
          return (a.startingPrice || 20) - (b.startingPrice || 20);
        }
        if (sortBy === "price-high") {
          return (b.startingPrice || 20) - (a.startingPrice || 20);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [
    initialMuseums,
    searchQuery,
    selectedCountry,
    selectedCity,
    selectedCategories,
    selectedFeatures,
    sortBy,
  ]);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Most Popular":
        return "bg-[#E67E22]/95 text-white border-amber-400/40";
      case "Top Rated":
        return "bg-[#184E3A]/95 text-white border-emerald-400/40";
      case "Bestseller":
        return "bg-[#C0392B]/95 text-white border-red-400/40";
      case "Family Friendly":
        return "bg-[#2C3E50]/95 text-white border-slate-400/40";
      case "Trending":
        return "bg-[#D35400]/95 text-white border-orange-400/40";
      case "Iconic":
        return "bg-[#165B4C]/95 text-white border-teal-400/40";
      default:
        return "bg-[#184E3A]/95 text-white border-emerald-400/40";
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Most Popular":
        return "⭐";
      case "Top Rated":
        return "🛡️";
      case "Bestseller":
        return "🏷️";
      case "Family Friendly":
        return "👨‍👩‍👧";
      case "Trending":
        return "🔥";
      case "Iconic":
        return "🏛️";
      default:
        return "⭐";
    }
  };

  return (
    <section className="bg-[#F8F9FA] py-10 sm:py-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Mobile Filter Toggle Button */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <p className="text-xs font-semibold text-gray-700">
            Showing <span className="font-bold text-[#184E3A]">{filteredMuseums.length}</span> museums
          </p>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#184E3A] shadow-sm transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12m-9 6h6" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          {/* ================= LEFT FILTER SIDEBAR ================= */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:w-[280px] lg:shrink-0 lg:overflow-visible lg:rounded-2xl lg:border lg:border-gray-100 lg:p-5 lg:shadow-sm ${
              mobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            {/* Sidebar Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#184E3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10m-7 6h4" />
                </svg>
                <h3 className="font-serif text-base font-bold text-[#1F2429]">Filter Results</h3>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-gray-400 transition hover:text-[#9E2B25]"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 lg:hidden"
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Country Selector */}
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-bold text-[#1F2429]">
                  <span className="flex items-center gap-1.5">
                    <GlobeIcon className="h-3.5 w-3.5 text-gray-500" />
                    Country
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity("");
                    }}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-[#1F2429] shadow-sm transition hover:border-gray-300 focus:border-[#184E3A] focus:outline-none"
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.country} value={c.country}>
                        {c.country}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* 2. City Selector */}
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-bold text-[#1F2429]">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-3.5 w-3.5 text-gray-500" />
                    City
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-[#1F2429] shadow-sm transition hover:border-gray-300 focus:border-[#184E3A] focus:outline-none"
                  >
                    <option value="">Select city</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* 3. Category Checkboxes */}
              <div className="border-t border-gray-100 pt-5">
                <h4 className="mb-3 text-xs font-bold text-[#1F2429]">Category</h4>
                <div className="space-y-2.5">
                  {categoriesList.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.key);
                    return (
                      <label
                        key={cat.key}
                        className="flex cursor-pointer items-center justify-between text-xs text-gray-600 transition hover:text-[#184E3A]"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.key)}
                            className="h-4 w-4 rounded border-gray-300 text-[#184E3A] focus:ring-[#184E3A]"
                          />
                          <span>{cat.label}</span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">({cat.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Popular Features */}
              <div className="border-t border-gray-100 pt-5">
                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[#1F2429]">
                  <span className="text-amber-500">★</span> Popular
                </h4>
                <div className="space-y-2.5">
                  {popularFeatureOptions.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat.key);
                    return (
                      <label
                        key={feat.key}
                        className="flex cursor-pointer items-center gap-2.5 text-xs text-gray-600 transition hover:text-[#184E3A]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFeature(feat.key)}
                          className="h-4 w-4 rounded border-gray-300 text-[#184E3A] focus:ring-[#184E3A]"
                        />
                        <span>{feat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Reset Filters Button */}
              <div className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-[#184E3A] shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
                >
                  <span>🔄</span>
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Backdrop for mobile drawer */}
          {mobileFilterOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
          )}

          {/* ================= RIGHT CARDS GRID ================= */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
              <p className="text-xs font-medium text-gray-500">
                Showing <span className="font-bold text-[#1F2429]">{filteredMuseums.length}</span>{" "}
                {filteredMuseums.length === 1 ? "museum" : "museums"}
              </p>

              <div className="flex items-center gap-3">
                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-7 font-bold text-[#1F2429] shadow-sm focus:border-[#184E3A] focus:outline-none"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Top Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "grid" ? "bg-white text-[#184E3A] shadow-xs" : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition ${
                      viewMode === "list" ? "bg-white text-[#184E3A] shadow-xs" : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="List view"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                      <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredMuseums.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF5ED] text-[#184E3A]">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                  </svg>
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1F2429]">No museums found</h4>
                <p className="mt-1.5 max-w-sm text-xs text-gray-500">
                  Try adjusting your country, city, category, or price filters to see available museums.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-5 rounded-full bg-[#184E3A] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123b2c]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Museum Cards Grid */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-5"
                }
              >
                {filteredMuseums.map((m) => {
                  const badge = m.cardBadge || (m.featured ? "Most Popular" : "Top Rated");
                  const badgeClass = getBadgeStyle(badge);
                  const badgeIcon = getBadgeIcon(badge);
                  const rating = m.rating || 4.7;
                  const reviews = m.reviewsCount || "10.2k";
                  const isWishlisted = !!wishlist[m.id];
                  const duration = m.duration || "2–3 hours";
                  const primaryFeature = (m.featuresList && m.featuresList[0]) || "Audio guide";

                  if (viewMode === "list") {
                    return (
                      <article
                        key={m.id}
                        className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="relative aspect-[16/10] sm:aspect-auto sm:w-72 shrink-0 overflow-hidden bg-gray-100">
                          <SafeImage
                            src={m.cardImage || m.heroImage}
                            alt={m.cardImageAlt || m.name}
                            fill
                            sizes="(min-width: 640px) 288px, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div
                            className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md border ${badgeClass}`}
                          >
                            <span>{badgeIcon}</span>
                            <span>{badge}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(m.id)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-110"
                            aria-label="Add to wishlist"
                          >
                            <span className={isWishlisted ? "text-red-500 scale-110" : "text-white"}>
                              {isWishlisted ? "❤️" : "🤍"}
                            </span>
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                              <span className="text-amber-500">★</span>
                              <span className="font-bold text-[#1F2429]">{rating.toFixed(1)}</span>
                              <span className="text-gray-400">({reviews})</span>
                            </div>

                            <h3 className="mt-1 font-serif text-xl font-bold text-[#1F2429] transition-colors group-hover:text-[#184E3A]">
                              <Link href={`/${m.slug}`}>{m.name}</Link>
                            </h3>

                            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-gray-500">
                              <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span>
                                {m.city}, {m.country}
                              </span>
                            </p>

                            <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-2">
                              {m.cardTagline || m.heroSubheading.replace(/<[^>]+>/g, "").slice(0, 120)}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1 font-medium">
                                <span>⏱</span> {duration}
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <span>{primaryFeature.includes("Audio") ? "🎧" : "🗣️"}</span> {primaryFeature}
                              </span>
                            </div>

                            <Link
                              href={`/${m.slug}`}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#184E3A] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123b2c]"
                            >
                              <span>View Details</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={m.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Card Image Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                        <SafeImage
                          src={m.cardImage || m.heroImage}
                          alt={m.cardImageAlt || m.name}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Left Promotional Badge */}
                        <div
                          className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md border ${badgeClass}`}
                        >
                          <span>{badgeIcon}</span>
                          <span>{badge}</span>
                        </div>

                        {/* Top Right Wishlist Heart */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(m.id)}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-110"
                          aria-label="Add to wishlist"
                        >
                          <span className={isWishlisted ? "text-red-500 scale-110" : "text-white"}>
                            {isWishlisted ? "❤️" : "🤍"}
                          </span>
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          {/* Rating & Reviews */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <span className="text-amber-500">★</span>
                            <span className="font-bold text-[#1F2429]">{rating.toFixed(1)}</span>
                            <span className="text-gray-400">({reviews})</span>
                          </div>

                          {/* Museum Title */}
                          <h3 className="mt-1.5 font-serif text-lg font-bold text-[#1F2429] transition-colors group-hover:text-[#184E3A]">
                            <Link href={`/${m.slug}`}>{m.name}</Link>
                          </h3>

                          {/* Location */}
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-gray-500">
                            <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>
                              {m.city}, {m.country}
                            </span>
                          </p>

                          {/* Excerpt / Summary */}
                          <p className="mt-2.5 text-xs leading-relaxed text-gray-600 line-clamp-2">
                            {m.cardTagline ||
                              `${m.name} in ${m.city}, ${m.country} offers timeless masterpieces and cultural treasures.`}
                          </p>
                        </div>

                        {/* Feature Badges & CTA */}
                        <div className="mt-5 border-t border-gray-100 pt-3">
                          {/* Quick details */}
                          <div className="mb-3.5 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-medium">
                              <span>⏱</span> {duration}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <span>{primaryFeature.includes("Audio") ? "🎧" : primaryFeature.includes("Guided") ? "🗣️" : "⚡"}</span> {primaryFeature}
                            </span>
                          </div>

                          {/* Full width button */}
                          <Link
                            href={`/${m.slug}`}
                            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#184E3A] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123b2c]"
                          >
                            <span>View Details</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
