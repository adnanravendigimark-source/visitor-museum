import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MailIcon } from "@/components/icons";
import { getContactPage } from "@/lib/contact";
import { getIconComponent } from "@/lib/iconMap";
import { resolveRobots, resolveCanonical, resolveOg } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContactPage();
  const og = resolveOg(
    { ogTitle: contact.ogTitle, ogDescription: contact.ogDescription, ogImage: contact.ogImage },
    { title: contact.metaTitle, description: contact.metaDescription }
  );
  return {
    title: contact.metaTitle,
    description: contact.metaDescription,
    alternates: { canonical: resolveCanonical("/contact", contact.canonicalUrl) },
    robots: resolveRobots(contact.noIndex, contact.noFollow),
    openGraph: { title: og.title, description: og.description, url: "/contact", images: og.image ? [{ url: og.image }] : undefined },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

export default async function ContactPage() {
  const contact = await getContactPage();

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-md bg-white border border-[#ECE8DE] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#B85D3E] shadow-sm">
              {contact.heroEyebrow}
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-[#112338] sm:text-4xl">
              {contact.heroHeading}
            </h1>
            <div
              className="rich-content mx-auto mt-3 max-w-md text-[#556476] leading-relaxed text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: contact.heroSubheading }}
            />
          </div>

          {/* Primary email card */}
          <div className="mt-10 flex flex-col items-center gap-3.5 rounded-2xl border border-[#E8ECEF] bg-white p-8 sm:p-10 text-center shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1B2B] text-white shadow-md">
              <MailIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">{contact.emailLabel}</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 block break-all font-serif text-2xl font-bold text-[#112338] hover:text-[#B85D3E] transition-colors"
              >
                {contact.email}
              </a>
            </div>
            <p className="text-xs text-[#556476] max-w-sm">{contact.emailNote}</p>
          </div>

          {/* What we can help with */}
          {contact.reasonsHeading && (
            <h2 className="mt-10 text-center font-serif text-xl font-bold text-[#112338] sm:text-2xl">
              {contact.reasonsHeading}
            </h2>
          )}
          <div className={`grid gap-6 sm:grid-cols-3 ${contact.reasonsHeading ? "mt-7" : "mt-10"}`}>
            {contact.reasons.map(({ icon, title, body }) => {
              const Icon = getIconComponent(icon);
              return (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-3xl border border-[#E8ECEF] bg-white p-6 text-center shadow-[0_1px_2px_rgba(17,35,56,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B85D3E]/30 hover:shadow-[0_16px_32px_-12px_rgba(17,35,56,0.18)] sm:text-left"
                >
                  {/* Soft accent glow, top-right — purely decorative, appears on hover */}
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#B85D3E]/[0.06] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1B2B] text-white shadow-[0_6px_16px_-4px_rgba(11,27,43,0.35)] transition-transform duration-300 group-hover:scale-105 sm:mx-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="relative mt-5 text-sm font-bold tracking-tight text-[#112338]">{title}</p>
                  <div
                    className="rich-content relative mt-2 text-xs leading-relaxed text-[#556476]"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                </div>
              );
            })}
          </div>

          <div
            className="rich-content mt-10 border-t border-[#E8ECEF] pt-8 text-center text-xs sm:text-sm text-[#718096]"
            dangerouslySetInnerHTML={{ __html: contact.footerNote }}
          />

          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-[#0B1B2B] p-7 text-center text-white shadow-xl border border-[#112338]">
            <p className="text-base font-bold text-white">{contact.ctaHeading}</p>
            <a
              href="/#museums"
              className="rounded-lg bg-white px-6 py-2.5 text-xs font-bold text-[#112338] shadow-md transition hover:bg-gray-100 hover:scale-[1.02]"
            >
              {contact.ctaButtonLabel} →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
