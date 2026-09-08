import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, getToursRawByMuseum, updateTourRecord, deleteTour, type TourRecord } from "@/lib/museums";
import { getSession } from "@/lib/session";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string; tourId: string } }) {
  const tour = (await getToursRawByMuseum(params.id)).find((t) => t.id === params.tourId);
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tour);
}

export async function PUT(req: Request, { params }: { params: { id: string; tourId: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as TourRecord | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const tours = await getToursRawByMuseum(params.id);
  if (!tours.some((t) => t.id === params.tourId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await updateTourRecord(params.tourId, { ...body, id: params.tourId, museumId: params.id });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string; tourId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete." }, { status: 403 });
  }

  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const tours = await getToursRawByMuseum(params.id);
  if (!tours.some((t) => t.id === params.tourId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteTour(params.tourId);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}
