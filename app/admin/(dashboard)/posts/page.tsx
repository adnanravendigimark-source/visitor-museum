import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { getSession } from "@/lib/session";
import DeleteButton from "@/components/admin/DeleteButton";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getPosts();
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-stone-600">Articles shown on /blog.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-canal-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-orange/90"
        >
          + New Post
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
          >
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <SafeImage src={post.image} alt={post.imageAlt} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-900">{post.title}</p>
              <p className="text-sm text-stone-500">
                {post.category} · {post.date} · /{post.slug}
              </p>
            </div>
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="shrink-0 text-sm font-medium text-stone-500 hover:underline"
            >
              View
            </Link>
            <Link
              href={`/admin/posts/${post.slug}`}
              className="shrink-0 text-sm font-medium text-canal-blue hover:underline"
            >
              Edit
            </Link>
            {isAdmin && (
              <DeleteButton
                url={`/api/admin/posts/${post.slug}`}
                confirmMessage={`Delete "${post.title}"? This can't be undone.`}
              />
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            No posts yet — write your first one.
          </p>
        )}
      </div>
    </div>
  );
}
