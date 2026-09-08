import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsers, updateUser, deleteUser, type UserRole } from "@/lib/users";
import { PAGE_KEYS, type PageKey } from "@/lib/pageAccess";
import { DB_ERROR_MESSAGE } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return null;
}

function parsePages(input: unknown): PageKey[] {
  if (!Array.isArray(input)) return [];
  return input.filter((p): p is PageKey => (PAGE_KEYS as readonly string[]).includes(p));
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const target = (await getUsers()).find((u) => u.id === params.id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim();
  const role: UserRole = body?.role === "admin" ? "admin" : "editor";
  const pages = parsePages(body?.pages);
  const password = typeof body?.password === "string" && body.password ? body.password : undefined;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase()) {
    return NextResponse.json({ error: "That email is reserved for the owner account." }, { status: 400 });
  }
  if (role === "editor" && pages.length === 0) {
    return NextResponse.json(
      { error: "Select at least one page this editor can access." },
      { status: 400 }
    );
  }
  if (password && password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const updated = await updateUser(params.id, { email, role, pages, password });
    return NextResponse.json(updated);
  } catch (err) {
    const isDbError = typeof err === "object" && err !== null && "code" in err;
    const message = isDbError ? DB_ERROR_MESSAGE : (err as Error).message || "Could not update user.";
    return NextResponse.json({ error: message }, { status: isDbError ? 500 : 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const target = (await getUsers()).find((u) => u.id === params.id);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (target.email.toLowerCase() === session.email.toLowerCase()) {
    return NextResponse.json({ error: "You can't delete your own account while logged in as it." }, { status: 400 });
  }

  try {
    await deleteUser(params.id);
  } catch {
    return NextResponse.json({ error: DB_ERROR_MESSAGE }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
