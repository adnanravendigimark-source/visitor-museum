import Link from "next/link";
import SafeImage from "./SafeImage";
import { getRelatedPosts } from "@/lib/posts";

export default async function RelatedPosts({ slug }: { slug: string }) {
  const related = await getRelatedPosts(slug, 2);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-gray-200 pt-12">
      <p className="text-2xl font-bold text-[#2A302F]">Related Guides & Articles</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#2D903A]/40 hover:shadow-md"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <SafeImage src={post.image} alt={post.imageAlt} fill quality={65} sizes="100px" className="object-cover transition group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D903A]">
                {post.category}
              </span>
              <p className="mt-1 text-sm font-bold text-[#2A302F] group-hover:text-[#2D903A] transition-colors">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
