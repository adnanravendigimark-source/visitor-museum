import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPosts, savePost, type Post } from "@/lib/posts";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPosts());
}

export async function POST(req: Request) {
  const body = (await req.json()) as Post;

  if (!body.slug || !body.title) {
    return NextResponse.json({ error: "Slug and title are required." }, { status: 400 });
  }
  const slugOk = /^[a-z0-9-]+$/.test(body.slug);
  if (!slugOk) {
    return NextResponse.json(
      { error: "Slug can only contain lowercase letters, numbers, and hyphens." },
      { status: 400 }
    );
  }

  const posts = await getPosts();
  if (posts.some((p) => p.slug === body.slug)) {
    return NextResponse.json({ error: "A post with this slug already exists." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const newPost: Post = {
    ...body,
    date: body.date || today,
    content: body.content || "",
    updatedAt: today,
  };
  try {
    await savePost(newPost);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  // Belt-and-suspenders on top of the existing force-dynamic + no-store
  // setup (middleware.ts) — new posts affect the listing page and the
  // sitemap immediately, not just their own detail page.
  revalidatePath("/blog");
  revalidatePath(`/blog/${body.slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
