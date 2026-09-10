import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getPosts, categorySlug, getCategoriesFromPosts } from "@/lib/posts";
import { resolveRobots, resolveCanonical } from "@/lib/seo";

// Statically rendered per category and cached — invalidated on demand by
// revalidatePath in the Posts admin save routes. See app/layout.tsx's
// removed force-dynamic export for why.

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const posts = await getPosts();
  const match = posts.find((p) => categorySlug(p.category) === params.category);
  const categoryTitle = match?.category || params.category.replace(/-/g, " ");
  return {
    title: `${categoryTitle} Articles - Visit Museums`,
    description: `Browse all articles and guides in the ${categoryTitle} category on Visit Museums.`,
    alternates: {
      canonical: resolveCanonical(`/category/${params.category}`),
    },
    robots: resolveRobots(false, false),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const allPosts = await getPosts();
  const posts = allPosts.filter((p) => categorySlug(p.category) === params.category);
  const categories = getCategoriesFromPosts(allPosts);
  const categoryTitle = posts[0]?.category || params.category.replace(/-/g, " ");
  const recentPosts = allPosts.slice(0, 6);

  return (
    <>
      <Header />
      <main className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: categoryTitle, path: `/category/${params.category}` },
            ]}
          />

          <header className="mt-6 mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2A302F]">
              Category: <span className="text-[#2D903A]">{categoryTitle}</span>
            </h1>
            <p className="mt-2 text-sm text-[#54595F]">
              Explore our curated travel guides, tips, and articles.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Post list / grid */}
            <div className="lg:col-span-8 space-y-10">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col sm:flex-row gap-6 bg-white border border-gray-100 rounded-xl overflow-hidden p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.image && (
                    <Link
                      href={`/${post.slug}`}
                      className="relative block w-full sm:w-56 h-48 sm:h-auto shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <SafeImage
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        fill
                        sizes="(min-width: 640px) 224px, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}

                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-xl font-bold text-[#2A302F] group-hover:text-[#2D903A] transition-colors leading-snug">
                        <Link href={`/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {post.excerpt && (
                        <p className="mt-3 text-sm text-[#54595F] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href={`/${post.slug}`}
                        className="text-xs font-semibold text-[#2D903A] hover:underline flex items-center gap-1"
                      >
                        Read More &raquo;
                      </Link>
                    </div>
                  </div>
                </article>
              ))}

              {posts.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
                  No articles in this category yet.{" "}
                  <Link href="/blog" className="font-medium text-[#2D903A] hover:underline">
                    Browse all guides →
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Recent Posts Widget */}
              <div className="rounded-xl border border-gray-100 bg-[#F9F9F9] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#2A302F] mb-4 pb-2 border-b border-gray-200">
                  Recent Posts
                </h3>
                <ul className="space-y-3 text-sm">
                  {recentPosts.map((p) => (
                    <li
                      key={p.slug}
                      className="border-b border-gray-200/60 pb-3 last:border-0 last:pb-0"
                    >
                      <Link
                        href={`/${p.slug}`}
                        className="font-medium text-[#2A302F] hover:text-[#2D903A] transition-colors leading-snug block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories Widget — real categories derived from posts,
                  never a fixed list */}
              <div className="rounded-xl border border-gray-100 bg-[#F9F9F9] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#2A302F] mb-4 pb-2 border-b border-gray-200">
                  Categories
                </h3>
                <ul className="space-y-2 text-sm">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        className={`flex items-center justify-between font-medium transition-colors ${
                          c.slug === params.category ? "text-[#2D903A]" : "text-[#2A302F] hover:text-[#2D903A]"
                        }`}
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
