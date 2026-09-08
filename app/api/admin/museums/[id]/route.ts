import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMuseumById, getMuseums, updateMuseum, deleteMuseum, type Museum } from "@/lib/museums";
import { getSession } from "@/lib/session";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const museum = await getMuseumById(params.id);
  if (!museum) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(museum);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => null)) as Museum | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const existing = await getMuseumById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.slug !== existing.slug) {
    const museums = await getMuseums();
    if (museums.some((m) => m.id !== params.id && m.slug === body.slug)) {
      return NextResponse.json({ error: "A museum with this URL slug already exists." }, { status: 400 });
    }
  }

  try {
    await updateMuseum(params.id, { ...body, id: params.id });
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  // The old slug's page and the museums grid both need to reflect the
  // change immediately — belt-and-suspenders on top of force-dynamic +
  // no-store, same reasoning as every other content-saving route.
  revalidatePath(`/${existing.slug}`);
  if (body.slug !== existing.slug) revalidatePath(`/${body.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete." }, { status: 403 });
  }

  const existing = await getMuseumById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await deleteMuseum(params.id);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }

  revalidatePath(`/${existing.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
