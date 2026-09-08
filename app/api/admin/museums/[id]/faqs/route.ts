import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, getFaqsByMuseum, saveFaqsForMuseum, type FAQ } from "@/lib/museums";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(await getFaqsByMuseum(params.id));
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as FAQ[] | null;
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array of FAQs." }, { status: 400 });
  }

  try {
    await saveFaqsForMuseum(params.id, body);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}
