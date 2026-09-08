"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SeoFieldsCard from "./SeoFieldsCard";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { BlogSeoSettings } from "@/lib/settings";

export default function BlogSeoForm({ initial }: { initial: BlogSeoSettings }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BlogSeoSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(initial), [settings, initial]);

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSettings(initial);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live at /blog now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <SeoFieldsCard
        showMeta
        pathHint="/blog"
        value={settings}
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
      />

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
