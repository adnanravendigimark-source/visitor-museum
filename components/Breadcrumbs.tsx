import Link from "next/link";
import { type BreadcrumbItem, buildBreadcrumbJsonLd } from "@/lib/seo";

// "light" (default): the standalone bordered white strip used on plainer
// pages (blog posts, category pages) that don't have a photo hero.
// "onImage": no background/border of its own, light/translucent-white
// text — meant to be rendered as the first thing inside a photo hero (see
// MuseumHero.tsx) instead of as a separate section above it. Both themes
// emit the same BreadcrumbList JSON-LD regardless of which is used.
export default function Breadcrumbs({
  items,
  theme = "light",
}: {
  items: BreadcrumbItem[];
  theme?: "light" | "onImage";
}) {
  if (!items || items.length === 0) return null;
  const jsonLd = buildBreadcrumbJsonLd(items);

  const nav = (
    <nav aria-label="Breadcrumb" className={theme === "onImage" ? "" : "border-b border-stone-100 bg-white"}>
      <div className={theme === "onImage" ? "" : "mx-auto max-w-[1140px] px-4 py-3 sm:px-6"}>
        <ol
          className={
            theme === "onImage"
              ? "flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-white/75"
              : "flex flex-wrap items-center gap-2 text-xs font-medium text-[#6B6B6B]"
          }
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.path + item.name} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span className={theme === "onImage" ? "text-white/40" : "text-stone-300"} aria-hidden="true">
                    ›
                  </span>
                )}
                {isLast ? (
                  <span
                    className={theme === "onImage" ? "font-semibold text-white" : "font-semibold text-[#2A302F]"}
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className={
                      theme === "onImage"
                        ? "transition-colors hover:text-white"
                        : "hover:text-[#2D903A] transition-colors"
                    }
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {nav}
    </>
  );
}
