import Link from "next/link";
import Logo from "./Logo";
import { getSiteChrome } from "@/lib/homepage";

export default async function Footer() {
  const { header, footer } = await getSiteChrome();

  return (
    <footer className="bg-[#0B1B2B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Tagline — admin-editable (Footer tagline) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo line1={header.logoLine1} line2={header.logoLine2} theme="dark" />
            <div
              className="rich-content rich-content-invert max-w-sm text-xs text-[#8A9BA8] leading-relaxed pt-1"
              dangerouslySetInnerHTML={{ __html: footer.tagline }}
            />
          </div>

          {/* Link Columns — admin-editable (Footer columns) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-[#8A9BA8]">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Address — admin-editable (Footer address) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {footer.addressHeading}
            </h3>
            <ul className="mt-4 space-y-3 text-xs text-[#8A9BA8]">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-white/80">📍</span>
                <span>
                  {footer.addressLine1}
                  {footer.addressLine2 && (
                    <>
                      <br />
                      {footer.addressLine2}
                    </>
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar — admin-editable (Footer copyright) */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#8A9BA8]">
          <p>© {new Date().getFullYear()} {footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
