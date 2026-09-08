import Link from "next/link";
import { type BreadcrumbItem, buildBreadcrumbJsonLd } from "@/lib/seo";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;
  const jsonLd = buildBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 text-xs text-sage-600 font-medium">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.path + item.name} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="text-warmstone-300">/</span>}
                {isLast ? (
                  <span className="font-bold text-charcoal-800" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-olive-700 transition-colors">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
