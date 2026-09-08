import { NextResponse } from "next/server";
import { getMediaLibrary, recordMediaUpload } from "@/lib/media";
import { getMediaUsageMap } from "@/lib/mediaUsage";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — same reasoning as upload/route.ts.
export const dynamic = "force-dynamic";

// Lists every image ever uploaded through the admin, newest first — powers
// the "Media Library" tab of every image picker so a previously uploaded
// or pasted image can be reused instead of re-uploaded. No section-specific
// pageKey gate in middleware.ts: any authenticated admin/editor can browse
// and reuse images regardless of which page they're editing. Each item also
// carries `usedIn` — every place on the site currently referencing that
// image URL — so the picker can show whether an image is safe to ignore or
// still live somewhere.
export async function GET() {
  const [items, usage] = await Promise.all([getMediaLibrary(), getMediaUsageMap()]);
  const withUsage = items.map((item) => ({ ...item, usedIn: usage[item.url] || [] }));
  return NextResponse.json({ items: withUsage });
}

// Records a bare external image URL into the library — the counterpart to
// upload/route.ts's automatic recording, for the case where an admin pastes
// an already-hosted image URL directly instead of uploading a file. No
// filename/content-type/size are known for a pasted URL, so those are left
// blank; `recordMediaUpload`'s ON CONFLICT (url) DO NOTHING makes this safe
// to call repeatedly (e.g. every image insert) without creating duplicates.
export async function POST(req: Request) {
  let url = "";
  try {
    const body = await req.json();
    url = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "A valid http(s) image URL is required." }, { status: 400 });
  }
  await recordMediaUpload({ url, filename: "", contentType: "", sizeBytes: 0 });
  return NextResponse.json({ ok: true });
}
