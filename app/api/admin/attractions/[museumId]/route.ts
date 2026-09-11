import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById } from "@/lib/museums";
import { getOtherAttractionsByMuseum, insertOtherAttraction, type OtherAttractionRecord } from "@/lib/otherAttractions";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { museumId: string } }) {
  return NextResponse.json(await getOtherAttractionsByMuseum(params.museumId));
}

export async function POST(req: Request, { params }: { params: { museumId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as OtherAttractionRecord | null;
  if (!body || !body.id || !body.title) {
    return NextResponse.json({ error: "ID and title are required." }, { status: 400 });
  }

  const attractions = await getOtherAttractionsByMuseum(params.museumId);
  if (attractions.some((a) => a.id === body.id)) {
    return NextResponse.json({ error: "An attraction with this ID already exists." }, { status: 400 });
  }

  try {
    await insertOtherAttraction(params.museumId, body);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}
