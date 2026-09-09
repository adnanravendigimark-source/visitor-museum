import { getHomepageContent } from "@/lib/homepage";

export default async function CtaBanner(props?: {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  const { sections } = await getHomepageContent();
  const s = {
    heading: props?.heading || sections?.ctaBanner?.heading || "Ready to explore the world's greatest museums?",
    subtext: props?.subtext || sections?.ctaBanner?.subtext || "Book skip-the-line tickets and guided tours today.",
    buttonText: props?.buttonText || sections?.ctaBanner?.buttonText || "Explore Tickets",
    buttonHref: props?.buttonHref || sections?.ctaBanner?.buttonHref || "#tickets",
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#2A302F] px-8 py-10 sm:px-12 sm:py-12 text-center text-white shadow-md">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {s.heading}
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              {s.subtext}
            </p>
            <div className="pt-2">
              <a
                href={s.buttonHref}
                className="inline-block rounded-full bg-[#2D903A] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23782F]"
              >
                {s.buttonText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
