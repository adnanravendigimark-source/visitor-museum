import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import { getAboutPage } from "@/lib/about";
import { resolveRobots, resolveCanonical, resolveOg } from "@/lib/seo";

// Statically rendered and cached — invalidated on demand by revalidatePath
// in the About admin save route. See app/layout.tsx's removed
// force-dynamic export for why.

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage();
  const og = resolveOg(
    { ogTitle: about.ogTitle, ogDescription: about.ogDescription, ogImage: about.ogImage },
    { title: about.metaTitle, description: about.metaDescription, image: about.heroImage }
  );
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: { canonical: resolveCanonical("/about", about.canonicalUrl) },
    robots: resolveRobots(about.noIndex, about.noFollow),
    openGraph: {
      title: og.title,
      description: og.description,
      url: "/about",
      images: og.image ? [{ url: og.image, alt: about.heroImageAlt }] : undefined,
    },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5]">
        {/* Hero banner — admin-editable (About page → Page title) */}
        <section className="relative overflow-hidden bg-[#0B1B2B] text-white">
          <div className="absolute inset-0">
            <SafeImage
              src={about.heroImage || "/images/hero-museums.jpg"}
              alt={about.heroImageAlt || "Museum gallery interior"}
              fill
              priority
              quality={68}
              sizes="100vw"
              className="object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-[#0B1B2B]/75 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#CBD5E1]">
              <ol className="flex items-center justify-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-white/40">&gt;</li>
                <li className="font-semibold text-white" aria-current="page">
                  About Us
                </li>
              </ol>
            </nav>

            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#E2A03F]">
              {about.heroEyebrow}
            </span>

            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {about.heroHeading}
            </h1>

            <div
              className="rich-content rich-content-invert mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#CBD5E1] sm:text-sm"
              dangerouslySetInnerHTML={{ __html: about.heroSubheading }}
            />
          </div>
        </section>

        {/* Page content — admin-editable (About page → Page Content) */}
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <div
            className="rich-content text-sm sm:text-[15px] leading-relaxed text-[#556476]"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
