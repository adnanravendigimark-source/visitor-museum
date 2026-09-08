import { NextResponse } from "next/server";
import { getPrivacyPolicy, savePrivacyPolicy } from "@/lib/legal";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPrivacyPolicy());
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const title = (body?.title || "").trim();
  const lastUpdatedLabel = body?.lastUpdatedLabel ?? "";
  const emptyStateText = body?.emptyStateText ?? "";
  const content = Array.isArray(body?.content) ? body.content : [];
  const noIndex = !!body?.noIndex;
  const noFollow = !!body?.noFollow;
  const canonicalUrl = body?.canonicalUrl || "";
  const metaTitle = body?.metaTitle || "";
  const metaDescription = body?.metaDescription || "";
  const ogTitle = body?.ogTitle || "";
  const ogDescription = body?.ogDescription || "";
  const ogImage = body?.ogImage || "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    await savePrivacyPolicy({
      title,
      lastUpdatedLabel,
      emptyStateText,
      content,
      noIndex,
      noFollow,
      canonicalUrl,
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
    });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
