import Link from "next/link";
import Logo from "./Logo";
import { getSiteChrome } from "@/lib/homepage";

// Same structural pattern as the pena-palace / amsterdam-boat-tours
// reference sites: a wide brand+tagline column, admin-editable link
// columns, and a dedicated address column, laid out on a 12-col grid
// instead of the old evenly-split 4-column grid. Colors stay Visit
// Museums' own brand green + rust accent (not pena's green/gold or
// amsterdam's navy/sky-blue) — only the layout and typography treatment
// (small-caps uppercase section headers) are matched.
export default async function Footer() {
  const { header, footer } = await getSiteChrome();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/20 bg-[#0F2B20] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Tagline */}
          <div className="space-y-4 lg:col-span-4">
            <Logo logoImage={header.logoImage} logoAlt={header.logoAlt || "Visit Museums"} theme="dark" />
            {footer.tagline && (
              <div
                className="max-w-sm pt-1 text-[13px] leading-relaxed text-white/70 [&_a]:underline [&_a]:hover:text-white"
                dangerouslySetInnerHTML={{ __html: footer.tagline }}
              />
            )}
          </div>

          {/* Admin-editable link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E2A03F]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-white/70">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Address */}
          {(footer.addressHeading || footer.addressLine1 || footer.addressLine2) && (
            <div className="lg:col-span-3">
              {footer.addressHeading && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#E2A03F]">
                  {footer.addressHeading}
                </h3>
              )}
              <p className="mt-4 text-xs leading-relaxed text-white/70">
                {footer.addressLine1}
                {footer.addressLine1 && footer.addressLine2 && <br />}
                {footer.addressLine2}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {footer.copyrightText || "Visit Museums. All rights reserved."}
          </p>
          <Link href="/" className="transition hover:text-white">
            Visit Museums
          </Link>
        </div>
      </div>
    </footer>
  );
}
