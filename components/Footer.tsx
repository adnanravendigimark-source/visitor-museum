import Link from "next/link";
import Logo from "./Logo";
import { getSiteChrome } from "@/lib/homepage";

export default async function Footer() {
  const { header, footer } = await getSiteChrome();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1F2429] text-[#ABB8C3]">
      <div className="mx-auto max-w-[1140px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <Logo logoImage={header.logoImage} logoAlt={header.logoAlt || "Visit Museums"} theme="dark" />
            {footer.tagline && (
              <div
                className="text-[14px] leading-relaxed text-[#ABB8C3] pt-2 [&_a]:underline [&_a]:hover:text-white"
                dangerouslySetInnerHTML={{ __html: footer.tagline }}
              />
            )}
            {(footer.addressHeading || footer.addressLine1 || footer.addressLine2) && (
              <div className="pt-2 text-[13px] leading-relaxed text-[#8A959E]">
                {footer.addressHeading && <p className="font-semibold text-[#ABB8C3]">{footer.addressHeading}</p>}
                {footer.addressLine1 && <p>{footer.addressLine1}</p>}
                {footer.addressLine2 && <p>{footer.addressLine2}</p>}
              </div>
            )}
          </div>

          {/* Columns 2+: admin-editable link columns (footer.columns) */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-[18px] font-semibold text-white mb-4">{col.title}</h2>
              <ul className="space-y-2.5 text-[14px]">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="transition-colors hover:text-[#2D903A]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 text-[13px] text-[#8A959E]">
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
