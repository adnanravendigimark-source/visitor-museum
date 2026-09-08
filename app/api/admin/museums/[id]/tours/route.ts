import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, getToursRawByMuseum, insertTour, type TourRecord } from "@/lib/museums";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(await getToursRawByMuseum(params.id));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as TourRecord | null;
  if (!body || !body.id || !body.title) {
    return NextResponse.json({ error: "ID and title are required." }, { status: 400 });
  }

  const tours = await getToursRawByMuseum(params.id);
  if (tours.some((t) => t.id === body.id)) {
    return NextResponse.json({ error: "A tour with this ID already exists." }, { status: 400 });
  }

  try {
    await insertTour(params.id, body);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}
