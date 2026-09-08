import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { recordMediaUpload } from "@/lib/media";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

// Saves an uploaded image to Vercel Blob storage and returns its public
// URL for use in a museum/tour/post/homepage image field. Uses Blob (not the
// local filesystem) specifically because Vercel's deployed functions have
// a read-only filesystem at runtime — this works identically in local dev
// and in production as long as BLOB_READ_WRITE_TOKEN is set.
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Image uploads aren't configured yet — add a Blob store to your Vercel project (Storage tab) and set BLOB_READ_WRITE_TOKEN in .env / your Vercel project's env vars. Paste an image URL instead for now.",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is larger than 8MB." }, { status: 400 });
  }

  const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const rawExt = extMatch ? extMatch[0].toLowerCase() : ".jpg";
  const ext = /^\.(jpg|jpeg|png|webp|gif|svg)$/.test(rawExt) ? rawExt : ".jpg";
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });
    // Never awaited-and-blocking on failure — the upload itself already
    // succeeded and the admin is waiting on this response. Recording it in
    // the Media Library is a permanent, additive log; nothing ever deletes
    // from Blob storage or this table, so a missed row here (e.g. schema
    // not migrated yet) only means this one file won't show up for reuse,
    // not that the upload failed.
    await recordMediaUpload({
      url: blob.url,
      filename: file.name || filename,
      contentType: file.type,
      sizeBytes: file.size,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed. " + ((err as Error).message || "Please try again or paste an image URL.") },
      { status: 500 }
    );
  }
}
