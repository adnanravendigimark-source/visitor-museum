import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getHomepageContent,
  saveHomepageCopy,
  saveHomepageSections,
  saveSiteHeader,
  saveSiteFooter,
  saveSiteTheme,
  type HomepageContent,
} from "@/lib/homepage";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getHomepageContent());
}

// Saves everything the Homepage admin tabs own: hero copy/CTA button, the
// site-wide sections (Grid/Highlights/CtaBanner/NotFound), the site-wide
// header/footer, and brand colors.
// Deliberately does NOT touch no_index/no_follow (owned by PUT
// /api/admin/indexing) even though the client still posts the full
// HomepageContent shape — see each save function in lib/homepage.ts for
// why that split exists. Unlike the single-attraction reference repos,
// there is no heroVideo field and no per-tour featured_tour_* columns —
// each museum owns its own tours in lib/museums.ts instead.
export async function PUT(req: Request) {
  // Whole handler wrapped in one try/catch — not just the DB call — so a
  // malformed body or any unexpected error still comes back as a real JSON
  // error the admin UI can show, instead of a platform error page that
  // fails to parse client-side and silently falls back to a generic
  // "Save failed" message with no indication of what actually went wrong.
  try {
    const body = (await req.json().catch(() => null)) as HomepageContent | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    await Promise.all([
      saveHomepageCopy({
        heroBadge: body.heroBadge,
        heroHeading: body.heroHeading,
        heroSubheading: body.heroSubheading,
        heroImage: body.heroImage,
        heroImageAlt: body.heroImageAlt,
        heroFeatures: body.heroFeatures || [],
        heroCtaPrimaryText: body.heroCtaPrimaryText || "",
        heroCtaPrimaryHref: body.heroCtaPrimaryHref || "",
        metaTitle: body.metaTitle || "",
        metaDescription: body.metaDescription || "",
        focusKeyword: body.focusKeyword || "",
        canonicalUrl: body.canonicalUrl || "",
        ogTitle: body.ogTitle || "",
        ogDescription: body.ogDescription || "",
        ogImage: body.ogImage || "",
      }),
      saveHomepageSections(body.sections),
      saveSiteHeader(body.header),
      saveSiteFooter(body.footer),
      saveSiteTheme(body.theme),
    ]);

    // Belt-and-suspenders on top of the existing force-dynamic + no-store
    // setup (middleware.ts) — explicitly clears Next's Full Route Cache
    // for the whole app (header/footer/theme render on every page, not
    // just "/") so edits show up on the very next request, no hard
    // refresh needed even in edge cases the no-store header doesn't cover
    // (e.g. a CDN or proxy in front of Vercel that still respects
    // stale-while-revalidate hints).
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}
