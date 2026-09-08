import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHomepageContent } from "@/lib/homepage";

export default async function NotFound() {
  const { sections } = await getHomepageContent();
  const s = sections.notFound;

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <p className="font-display text-7xl font-bold text-terracotta-500">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          {s.heading}
        </h1>
        <p className="mt-3 max-w-md text-navy-700">{s.body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={s.primaryButtonHref || "/#museums"}
            className="rounded-xl bg-navy-700 px-6 py-3 text-sm font-bold text-marble-50 shadow-md ring-1 ring-navy-600 transition hover:bg-navy-800 hover:scale-[1.02]"
          >
            {s.primaryButtonText || "Browse Museums & Attractions →"}
          </Link>
          <Link
            href={s.secondaryButtonHref || "/blog"}
            className="rounded-xl border border-tuscan-300 bg-marble-50 px-6 py-3 text-sm font-bold text-navy-800 transition hover:bg-tuscan-100"
          >
            {s.secondaryButtonText || "Read Travel Guides"}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
