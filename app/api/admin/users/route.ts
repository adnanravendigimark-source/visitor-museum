import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSafeUsers, createUser, type UserRole } from "@/lib/users";
import { PAGE_KEYS, type PageKey } from "@/lib/pageAccess";
import { DB_ERROR_MESSAGE } from "@/lib/db";

// Force this route to always run as a live serverless function rather than
// get statically optimized at build time — Next.js can otherwise pre-render
// a GET-only static response for a route handler like this and silently drop
// every other exported method (PUT/POST/DELETE), returning 405 for all of
// them in production even though the code is correct.
export const dynamic = "force-dynamic";

// Middleware already restricts this whole path to role "admin", but we
// check again here too — never trust a single layer for something that
// creates/removes login credentials.
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

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getSafeUsers());
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim();
  const password = body?.password || "";
  const role: UserRole = body?.role === "admin" ? "admin" : "editor";
  const pages = parsePages(body?.pages);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase()) {
    return NextResponse.json({ error: "That email is already the owner account." }, { status: 400 });
  }
  if (role === "editor" && pages.length === 0) {
    return NextResponse.json(
      { error: "Select at least one page this editor can access." },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(email, password, role, pages);
    return NextResponse.json(user);
  } catch (err) {
    const isDbError = typeof err === "object" && err !== null && "code" in err;
    const message = isDbError ? DB_ERROR_MESSAGE : (err as Error).message || "Could not create user.";
    return NextResponse.json({ error: message }, { status: isDbError ? 500 : 400 });
  }
}
