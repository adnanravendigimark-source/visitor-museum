import { NextResponse } from "next/server";
import { getBlogSeoSettings, saveBlogSeoSettings } from "@/lib/settings";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

// Access to /admin/pages and /api/admin/settings is gated by the "pages"
// page-access key in middleware.ts, same pattern as posts/homepage/privacy
// — no extra in-route auth check needed here. About and Contact now have
// their own dedicated routes (/api/admin/about, /api/admin/contact) — this
// route only covers the Blog listing page's SEO fields.

export async function GET() {
  return NextResponse.json(await getBlogSeoSettings());
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const data = {
    metaTitle: body?.metaTitle || "",
    metaDescription: body?.metaDescription || "",
    canonicalUrl: body?.canonicalUrl || "",
    noIndex: !!body?.noIndex,
    noFollow: !!body?.noFollow,
    ogTitle: body?.ogTitle || "",
    ogDescription: body?.ogDescription || "",
    ogImage: body?.ogImage || "",
  };

  try {
    await saveBlogSeoSettings(data);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
