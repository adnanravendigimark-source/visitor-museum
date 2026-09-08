import { getFaqsByMuseum } from "@/lib/museums";
import type { Museum } from "@/lib/museums";
import FaqAccordion from "./FaqAccordion";

export default async function MuseumFaqSection({ museum }: { museum: Museum }) {
  const faqs = await getFaqsByMuseum(museum.id);
  if (!faqs.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
    })),
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="text-center mb-10">
          {museum.faqEyebrow && (
            <span className="block text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
              {museum.faqEyebrow}
            </span>
          )}
          <h2 className="mt-2.5 text-3xl sm:text-4xl font-bold text-[#2A302F]">
            {museum.faqHeading || "FAQ"}
          </h2>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
