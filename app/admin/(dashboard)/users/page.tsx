import { getSafeUsers } from "@/lib/users";
import { getSession } from "@/lib/session";
import UserForm from "@/components/admin/UserForm";
import UsersList from "@/components/admin/UsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getSafeUsers();
  const session = await getSession();
  const rootEmail = process.env.ADMIN_EMAIL || "";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Users</h1>
      <p className="mt-1 text-sm text-stone-600">
        Only admins can see this page. Editors can view and edit site content, but can't delete
        anything and can't manage other users.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <p className="font-semibold text-stone-900">Add a user</p>
        <p className="mt-0.5 text-xs text-stone-500">
          Give them the email and password directly — there's no invite email, so share it with
          them yourself.
        </p>
        <div className="mt-4">
          <UserForm />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-sage-500/30 bg-sage-500/5 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-500 text-sm font-bold text-white">
          {rootEmail.slice(0, 1).toUpperCase() || "A"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-900">{rootEmail || "(not set)"}</p>
          <p className="text-sm text-stone-500">Owner · full access · set in .env, can't be deleted here</p>
        </div>
      </div>

      <UsersList users={users} currentEmail={session?.email} />
    </div>
  );
}
