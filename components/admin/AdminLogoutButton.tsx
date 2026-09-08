"use client";

import { useRouter } from "next/navigation";
import { LogoutIcon } from "./icons";

export default function AdminLogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
      >
        <LogoutIcon className="h-3.5 w-3.5" /> Log out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-left text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white"
    >
      <LogoutIcon className="h-4 w-4" /> Log out
    </button>
  );
}
