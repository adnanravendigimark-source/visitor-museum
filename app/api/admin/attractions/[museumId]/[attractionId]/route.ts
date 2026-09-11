import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById } from "@/lib/museums";
import { getOtherAttractionById, updateOtherAttraction, deleteOtherAttraction, type OtherAttractionRecord } from "@/lib/otherAttractions";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { museumId: string; attractionId: string } }) {
  const attraction = await getOtherAttractionById(params.attractionId);
  if (!attraction || attraction.museumId !== params.museumId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(attraction);
}

export async function PUT(req: Request, { params }: { params: { museumId: string; attractionId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as OtherAttractionRecord | null;
  if (!body || !body.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const existing = await getOtherAttractionById(params.attractionId);
  if (!existing || existing.museumId !== params.museumId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await updateOtherAttraction(params.attractionId, { ...body, id: params.attractionId, museumId: params.museumId });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { museumId: string; attractionId: string } }) {
  const museum = await getMuseumById(params.museumId);
  if (!museum) return NextResponse.json({ error: "Museum not found." }, { status: 404 });

  const existing = await getOtherAttractionById(params.attractionId);
  if (!existing || existing.museumId !== params.museumId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteOtherAttraction(params.attractionId);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${museum.slug}`);
  return NextResponse.json({ ok: true });
}
