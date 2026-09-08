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
    <section id="faq" className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#EAE6DE]/70">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85D3E]">
            {museum.faqEyebrow}
          </p>
          <h2 className="mt-2.5 font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#112338] tracking-tight">
            {museum.faqHeading}
          </h2>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
