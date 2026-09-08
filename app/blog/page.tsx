import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getPosts, getCategoriesFromPosts } from "@/lib/posts";
import { getBlogSeoSettings } from "@/lib/settings";
import { resolveRobots, resolveCanonical, resolveOg } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getBlogSeoSettings();
  const og = resolveOg(
    { ogTitle: seo.ogTitle, ogDescription: seo.ogDescription, ogImage: seo.ogImage },
    { title: seo.metaTitle, description: seo.metaDescription, image: "" }
  );
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: resolveCanonical("/blog", seo.canonicalUrl) },
    robots: resolveRobots(seo.noIndex, seo.noFollow),
    openGraph: {
      title: og.title,
      description: og.description,
      url: "/blog",
      images: og.image ? [{ url: og.image }] : undefined,
    },
    twitter: { card: "summary_large_image", title: og.title, description: og.description, images: og.image ? [og.image] : undefined },
  };
}

// Simple, case-insensitive match against title/excerpt/category/content —
// good enough for a blog this size without needing a search index.
function matchesQuery(post: { title: string; excerpt: string; category: string; content: string }, query: string): boolean {
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.excerpt.toLowerCase().includes(q) ||
    post.category.toLowerCase().includes(q) ||
    post.content.toLowerCase().includes(q)
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const allPosts = await getPosts();
  const query = (searchParams?.q || "").trim();
  const posts = query ? allPosts.filter((p) => matchesQuery(p, query)) : allPosts;
  const recentPosts = allPosts.slice(0, 6);
  const categories = getCategoriesFromPosts(allPosts);

  return (
    <>
      <Header />
      <main className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
            ]}
          />

          <header className="mt-6 mb-10">
            {query ? (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#2A302F]">
                  Search results for &ldquo;{query}&rdquo;
                </h1>
                <p className="mt-2 text-sm text-[#54595F]">
                  {posts.length} {posts.length === 1 ? "guide" : "guides"} found.{" "}
                  <Link href="/blog" className="font-medium text-[#184E3A] hover:underline">
                    Clear search
                  </Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#2A302F]">
                  Museum Guides &amp; Travel Blog
                </h1>
                <p className="mt-2 text-sm text-[#54595F]">
                  Explore our curated travel guides, skip-the-line ticket advice, and visitor tips for the world&apos;s best museums.
                </p>
              </>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Post list */}
            <div className="lg:col-span-8 space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col sm:flex-row gap-6 bg-white border border-gray-150 rounded-2xl overflow-hidden p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.image && (
                    <Link
                      href={`/${post.slug}`}
                      className="relative block w-full sm:w-60 h-48 sm:h-auto shrink-0 overflow-hidden rounded-xl bg-gray-100"
                    >
                      <SafeImage
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        fill
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}

                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-xl font-bold text-[#182220] group-hover:text-[#184E3A] transition-colors leading-snug">
                        <Link href={`/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {post.excerpt && (
                        <p className="mt-3 text-sm text-[#55605E] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href={`/${post.slug}`}
                        className="text-xs font-bold text-[#184E3A] hover:underline flex items-center gap-1"
                      >
                        Read Article &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              ))}

              {posts.length === 0 && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-500">
                  {query
                    ? "No guides matched your search."
                    : "No articles found. Check back soon for new museum travel guides!"}
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Recent Posts Widget */}
              <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#182220] mb-4 pb-2 border-b border-gray-200">
                  Recent Guides
                </h3>
                <ul className="space-y-3 text-sm">
                  {recentPosts.map((p) => (
                    <li
                      key={p.slug}
                      className="border-b border-gray-200/60 pb-3 last:border-0 last:pb-0"
                    >
                      <Link
                        href={`/${p.slug}`}
                        className="font-medium text-[#182220] hover:text-[#184E3A] transition-colors leading-snug block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories Widget — real categories derived from posts,
                  never a fixed list */}
              <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#182220] mb-4 pb-2 border-b border-gray-200">
                  Categories
                </h3>
                <ul className="space-y-2 text-sm">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        className="flex items-center justify-between font-medium text-[#182220] hover:text-[#184E3A] transition-colors"
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-gray-400">({c.count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
