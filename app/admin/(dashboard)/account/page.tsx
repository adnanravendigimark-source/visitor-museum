import { getSession } from "@/lib/session";
import AdminPasswordForm from "@/components/admin/AdminPasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">My Account</h1>
      <p className="mt-1 text-sm text-stone-600">
        Manage your own login credentials. Changes take effect immediately.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-canal-ink text-base font-bold text-white">
            {session?.email?.slice(0, 1).toUpperCase() || "A"}
          </span>
          <div>
            <p className="font-semibold text-stone-900">{session?.email}</p>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                session?.role === "admin"
                  ? "bg-sage-500/15 text-sage-700"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {session?.role}
            </span>
          </div>
        </div>

        <div className="pt-5">
          <p className="mb-4 font-semibold text-stone-900">Change password</p>
          <AdminPasswordForm />
        </div>
      </div>
    </div>
  );
}
