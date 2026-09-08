"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  confirmMessage,
  label = "Delete",
}: {
  url: string;
  confirmMessage: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        return;
      }
      let message = `Delete failed (${res.status}). Please try again.`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        // response wasn't JSON — fall back to the generic message above
      }
      alert(message);
    } catch {
      alert("Delete failed — couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-60"
    >
      {loading ? "Deleting…" : label}
    </button>
  );
}
