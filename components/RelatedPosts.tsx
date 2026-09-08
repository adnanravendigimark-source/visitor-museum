import Link from "next/link";
import SafeImage from "./SafeImage";
import { getRelatedPosts } from "@/lib/posts";
import { getHomepageContent } from "@/lib/homepage";

export default async function RelatedPosts({ slug }: { slug: string }) {
  const [related, { sections }] = await Promise.all([getRelatedPosts(slug, 2), getHomepageContent()]);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-tuscan-200 pt-12">
      <p className="font-display text-2xl font-bold text-navy-900">{sections.blogPage?.relatedGuidesHeading || "Related Guides & Articles"}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 rounded-2xl border border-tuscan-200 bg-marble-50 p-4 transition-all hover:border-navy-700/40 hover:shadow-lg"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-navy-900">
              <SafeImage src={post.image} alt={post.imageAlt} fill quality={65} sizes="100px" className="object-cover transition group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
                {post.category}
              </span>
              <p className="mt-1 text-sm font-bold text-navy-900 group-hover:text-terracotta-600 transition-colors">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
