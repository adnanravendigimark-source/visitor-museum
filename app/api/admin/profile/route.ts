import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUsers, updateUser } from "@/lib/users";
import { verifyPassword } from "@/lib/passwords";
import { verifyOwnerPassword, setAdminPasswordHash } from "@/lib/adminPassword";
import { DB_ERROR_MESSAGE } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT /api/admin/profile — lets the currently-logged-in admin/editor
// change their own password. Requires current password for verification.
// Works for both the .env owner account and DB users.
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword: string = body?.currentPassword || "";
  const newPassword: string = body?.newPassword || "";
  const confirmPassword: string = body?.confirmPassword || "";

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const rootEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();

  // .env owner account — verify via the same helper login uses, then store
  // the new hash in site_settings so future logins use the new password.
  if (session.email.toLowerCase() === rootEmail) {
    const verified = await verifyOwnerPassword(currentPassword);
    if (!verified) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    try {
      await setAdminPasswordHash(newPassword);
      return NextResponse.json({ ok: true });
    } catch (err) {
      const isDbError = typeof err === "object" && err !== null && "code" in err;
      const message = isDbError ? DB_ERROR_MESSAGE : (err as Error).message || "Could not update password.";
      return NextResponse.json({ error: message }, { status: isDbError ? 500 : 400 });
    }
  }

  // DB user — verify current password then update via updateUser.
  try {
    const users = await getUsers();
    const dbUser = users.find((u) => u.email.toLowerCase() === session.email.toLowerCase());

    if (!dbUser) {
      return NextResponse.json({ error: "Account not found in the database." }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, dbUser.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    await updateUser(dbUser.id, { password: newPassword });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const isDbError = typeof err === "object" && err !== null && "code" in err;
    const message = isDbError ? DB_ERROR_MESSAGE : (err as Error).message || "Could not update password.";
    return NextResponse.json({ error: message }, { status: isDbError ? 500 : 400 });
  }
}
