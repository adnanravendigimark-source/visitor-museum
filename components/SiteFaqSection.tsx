import { getHomepageContent } from "@/lib/homepage";
import FaqAccordion from "./FaqAccordion";

// Site-wide FAQ near the bottom of the homepage — general trust/booking
// questions ("Is this an official seller?", "Can I get a refund?"), distinct
// from MuseumFaqSection.tsx which shows per-museum questions on each
// museum's own page. Content is entirely admin-owned (Homepage -> "Homepage
// FAQ" -> content.sections.faq), matching how the reference single-attraction
// sites (amsterdam-boat-tours, arno-boat-cruise, pena-palace) all mount a
// FAQSection on their homepage.
export default async function SiteFaqSection() {
  const { sections } = await getHomepageContent();
  const faq = sections.faq;

  if (!faq.items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      },
    })),
  };

  return (
    <section id="faq" className="border-t border-gray-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="mb-10 text-center">
          {faq.eyebrow && (
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-canal-blue sm:text-xs">
              {faq.eyebrow}
            </span>
          )}
          <h2 className="mt-2.5 font-serif text-3xl font-bold text-[#182220] sm:text-4xl">
            {faq.heading}
          </h2>
          {faq.subheading && (
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#54595F] sm:text-base">{faq.subheading}</p>
          )}
        </div>

        <FaqAccordion faqs={faq.items} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
