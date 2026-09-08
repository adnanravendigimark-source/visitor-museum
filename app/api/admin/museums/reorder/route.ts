import { NextResponse } from "next/server";
import { reorderMuseums } from "@/lib/museums";
import { dbErrorMessage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as { orderedIds?: string[] } | null;
  if (!body || !Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "Expected { orderedIds: string[] }." }, { status: 400 });
  }
  try {
    await reorderMuseums(body.orderedIds);
  } catch (err) {
    return NextResponse.json({ error: dbErrorMessage(err) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
