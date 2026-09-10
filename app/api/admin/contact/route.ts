import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContactPage, saveContactPage, type ContactPageContent } from "@/lib/contact";
import { dbErrorMessage } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — see the identical comment on
// every other /api/admin/* route for why this matters.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getContactPage());
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as ContactPageContent | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Contact email is required." }, { status: 400 });
    }
    await saveContactPage({
      ...body,
      reasons: Array.isArray(body.reasons) ? body.reasons : [],
    });
    // /contact is now statically cached (see app/contact/page.tsx) — bust
    // it so this edit shows up immediately.
    revalidatePath("/contact");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
}
