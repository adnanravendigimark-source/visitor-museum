import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import AdminShell from "@/components/admin/AdminShell";

// Belt-and-suspenders alongside the X-Robots-Tag header middleware already
// sets on every /admin response — this covers the <meta name="robots">
// tag specifically. Applies to every page under this layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";
  const pages = session?.pages || [];

  return (
    <AdminShell
      isAdmin={isAdmin}
      pages={pages}
      sessionEmail={session?.email}
      sessionRole={session?.role}
      brandName="Visit Museums"
      brandColorClass="text-canal-orange"
      avatarColorClass="bg-canal-ink"
    >
      {children}
    </AdminShell>
  );
}
