import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getIndexingOverview, setIndexing, type IndexingPageType } from "@/lib/indexing";
import { getMuseumById } from "@/lib/museums";
import { getPost } from "@/lib/posts";
import { dbErrorMessage } from "@/lib/db";

// Maps an indexing change to the one public path it affects, now that
// these pages are statically cached rather than force-dynamic — without
// this, a noindex/nofollow toggle wouldn't show up until the next
// unrelated edit or deploy.
async function revalidateForIndexingChange(type: IndexingPageType, slug?: string) {
  switch (type) {
    case "homepage":
      return revalidatePath("/");
    case "about":
      return revalidatePath("/about");
    case "contact":
      return revalidatePath("/contact");
    case "privacy":
      return revalidatePath("/privacy-policy");
    case "blog":
      return revalidatePath("/blog");
    case "museum": {
      if (!slug) return;
      const museum = await getMuseumById(slug);
      if (museum) revalidatePath(`/${museum.slug}`);
      return;
    }
    case "post": {
      if (!slug) return;
      const post = await getPost(slug);
      if (post) revalidatePath(`/${post.slug}`);
      return;
    }
  }
}

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — see the identical comment on
// every other /api/admin/* route for why this matters.
export const dynamic = "force-dynamic";

const VALID_TYPES: IndexingPageType[] = ["homepage", "blog", "privacy", "about", "contact", "post", "museum"];

// This tab controls a site-wide setting that spans every content section
// (homepage, every blog post, privacy policy, about, contact) — rather
// than gating it behind one of the per-section PAGE_KEYS like every other
// /api/admin/* route, it's restricted to the admin role only, same as
// /api/admin/users. Middleware already blocks non-admins from reaching
// this path at all — checked again here too, never trust a single layer.
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await getIndexingOverview());
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}

// Applies exactly one page's Index/Follow change — the client always
// confirms with the user first (see IndexingManager.tsx's warning
// dialog), so by the time this is called the change is already approved;
// this endpoint just needs to touch the one row it's told to and nothing
// else, which is why lib/indexing.ts's setIndexing() only ever runs a
// scoped UPDATE on that page's own no_index/no_follow columns.
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const type = body?.type as IndexingPageType;
  const slug = typeof body?.slug === "string" ? body.slug : undefined;
  const noIndex = !!body?.noIndex;
  const noFollow = !!body?.noFollow;

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown page type." }, { status: 400 });
  }
  if (type === "post" && !slug) {
    return NextResponse.json({ error: "A post slug is required." }, { status: 400 });
  }
  if (type === "museum" && !slug) {
    return NextResponse.json({ error: "A museum id is required." }, { status: 400 });
  }

  try {
    await setIndexing(type, noIndex, noFollow, slug);
    await revalidateForIndexingChange(type, slug);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}
