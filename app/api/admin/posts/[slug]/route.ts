import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPosts, getPost, savePost, deletePost, type Post } from "@/lib/posts";
import { recordSlugRename } from "@/lib/redirects";
import { getSession } from "@/lib/session";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const body = (await req.json()) as Post;
  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.slug === params.slug);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The editor now allows changing the slug (renaming the post's URL).
  // Validate + de-dupe exactly like a brand-new post would, just
  // excluding this post's own current row from the collision check.
  const nextSlug = (body.slug || params.slug).trim();
  const renamed = nextSlug !== params.slug;
  if (renamed) {
    if (!/^[a-z0-9-]+$/.test(nextSlug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens." },
        { status: 400 }
      );
    }
    if (posts.some((p, i) => i !== idx && p.slug === nextSlug)) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 400 });
    }
  }

  const updated: Post = {
    ...body,
    slug: nextSlug,
    content: body.content || "",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  try {
    // slug is the primary key, so on a rename this INSERTs a brand-new row
    // for nextSlug rather than updating in place — the old row has to be
    // deleted explicitly or it's left behind as an orphaned duplicate.
    await savePost(updated);
    if (renamed) {
      await deletePost(params.slug);
      await recordSlugRename(params.slug, nextSlug);
    }
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${params.slug}`);
  if (renamed) revalidatePath(`/blog/${nextSlug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true, slug: nextSlug });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete." }, { status: 403 });
  }

  const existing = await getPost(params.slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await deletePost(params.slug);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${params.slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
