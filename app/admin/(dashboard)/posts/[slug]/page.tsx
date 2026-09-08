import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { getAllTours } from "@/lib/museums";
import { getAllRedirects } from "@/lib/redirects";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  const [tours, redirects] = await Promise.all([getAllTours(), getAllRedirects()]);
  const incomingRedirects = redirects.filter((r) => r.newSlug === post.slug);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Edit Post</h1>
      <p className="mt-1 text-sm text-stone-600">Editing "{post.title}"</p>
      <div className="mt-8 max-w-7xl">
        <PostForm initial={post} isNew={false} tours={tours} incomingRedirects={incomingRedirects} />
      </div>
    </div>
  );
}
