import Link from "next/link";
import SafeImage from "./SafeImage";
import { getPosts } from "@/lib/posts";
import { getHomepageContent } from "@/lib/homepage";

// The homepage's "Popular Articles & Guides" teaser — 3 latest published
// posts plus a "View All Articles" link to /blog. All copy (eyebrow,
// heading, subheading, button labels) comes from the admin's Homepage ->
// "Blog Teaser section" fields (content.sections.blogTeaser), not hardcoded,
// so this reads the same way the equivalent section does on every other
// site in this family (amsterdam-boat-tours, arno-boat-cruise, pena-palace).
export default async function BlogSection() {
  const [allPosts, { sections }] = await Promise.all([getPosts(), getHomepageContent()]);
  const posts = allPosts.filter((p) => !p.noIndex).slice(0, 3);
  const s = sections.blogTeaser;

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-stone-100 bg-stone-50/70 py-16 sm:py-24" id="blog-guides">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-canal-blue">
              {s.eyebrow}
            </span>
            <h2 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-[#182220] sm:text-4xl">
              {s.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#54595F] sm:text-base">{s.subheading}</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 self-start rounded-full border-2 border-canal-blue bg-white px-6 py-2.5 text-sm font-bold text-canal-blue transition hover:bg-canal-blue hover:text-white md:self-auto"
          >
            <span>{s.viewAllText}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-stone-100">
                <SafeImage
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6">
                {post.category && (
                  <span className="inline-flex w-fit rounded-full bg-canal-blue/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-canal-blue">
                    {post.category}
                  </span>
                )}
                <h3 className="mt-3 text-lg font-bold leading-snug text-[#182220] transition-colors group-hover:text-canal-blue line-clamp-2">
                  <Link href={`/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt && (
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#54595F]">{post.excerpt}</p>
                )}
                <div className="mt-auto border-t border-stone-100 pt-4">
                  <Link
                    href={`/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-canal-blue transition group-hover:gap-2.5"
                  >
                    <span>{s.readArticleText}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
