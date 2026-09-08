"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchIcon } from "./icons";

export default function BlogSearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("q") || "";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles..."
        className="w-full rounded-xl border border-warmstone-200 bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-sage-500 focus:border-olive-600 focus:outline-none focus:ring-1 focus:ring-olive-600"
      />
    </div>
  );
}
