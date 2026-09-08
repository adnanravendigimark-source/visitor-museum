"use client";

import { useState } from "react";
import Link from "next/link";
import type { IndexingRow, IndexingPageType } from "@/lib/indexing";

type Field = "noIndex" | "noFollow";

interface PendingChange {
  row: IndexingRow;
  field: Field;
  nextValue: boolean; // the new value of noIndex/noFollow if confirmed
}

function MiniToggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        enabled ? "bg-green-500" : "bg-stone-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function sectionTitle(type: IndexingPageType) {
  switch (type) {
    case "homepage":
      return "Homepage";
    case "about":
      return "About";
    case "contact":
      return "Contact";
    case "blog":
      return "Blog";
    case "privacy":
      return "Legal";
    case "museum":
      return "Museums & Attractions";
    case "post":
      return "Blog Posts";
  }
}

export default function IndexingManager({ initial }: { initial: IndexingRow[] }) {
  const [rows, setRows] = useState<IndexingRow[]>(initial);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  function requestChange(row: IndexingRow, field: Field) {
    setError("");
    setPending({ row, field, nextValue: !row[field] });
  }

  async function confirmChange() {
    if (!pending) return;
    const { row, field, nextValue } = pending;
    setApplying(true);
    setError("");

    const patch = { noIndex: row.noIndex, noFollow: row.noFollow, [field]: nextValue };

    const res = await fetch("/api/admin/indexing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: row.type, slug: row.slug, ...patch }),
    });
    const data = await res.json().catch(() => ({}));
    setApplying(false);

    if (!res.ok) {
      setError(data.error || "Could not save that change. Please try again.");
      setPending(null);
      return;
    }

    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, ...patch } : r)));
    setPending(null);
  }

  const grouped = rows.reduce<Record<string, IndexingRow[]>>((acc, row) => {
    const title = sectionTitle(row.type);
    (acc[title] ||= []).push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-stone-200 bg-stone-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <span>Page</span>
          <span className="text-center">Index</span>
          <span className="text-center">Follow</span>
        </div>

        {Object.entries(grouped).map(([title, sectionRows]) => (
          <div key={title}>
            <p className="border-b border-stone-100 bg-stone-50/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              {title}
            </p>
            {sectionRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-stone-100 px-5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-900">{row.label}</p>
                  <p className="truncate text-xs text-stone-400">{row.url}</p>
                </div>
                <div className="flex justify-center">
                  <MiniToggle enabled={!row.noIndex} onClick={() => requestChange(row, "noIndex")} />
                </div>
                <div className="flex justify-center">
                  <MiniToggle enabled={!row.noFollow} onClick={() => requestChange(row, "noFollow")} />
                </div>
              </div>
            ))}
          </div>
        ))}

        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-stone-500">No pages found yet.</p>
        )}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <p className="font-semibold text-stone-900">
              {pending.field === "noIndex" ? "Change search indexing?" : "Change link following?"}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {pending.field === "noIndex" ? (
                pending.nextValue ? (
                  <>
                    <strong>{pending.row.label}</strong> will stop showing up in Google and other
                    search results. The page itself stays live — it just won't be indexed.
                  </>
                ) : (
                  <>
                    <strong>{pending.row.label}</strong> will become indexable again — Google can
                    show it in search results.
                  </>
                )
              ) : pending.nextValue ? (
                <>
                  Links on <strong>{pending.row.label}</strong> will be marked{" "}
                  <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">nofollow</code> — search
                  engines won't pass authority through them.
                </>
              ) : (
                <>
                  Links on <strong>{pending.row.label}</strong> will be followed normally again.
                </>
              )}
            </p>
            <p className="mt-3 text-xs text-stone-400">
              This takes effect on the live site immediately — are you sure?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={applying}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmChange}
                disabled={applying}
                className="rounded-lg bg-canal-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-canal-blue/90 disabled:opacity-60"
              >
                {applying ? "Saving…" : "Yes, change it"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-stone-400">
        Meta title, description, canonical URL, and social preview for each page are still edited on
        that page's own editor — this tab is only for the Index/Follow switches. See{" "}
        <Link href="/admin" className="underline">
          Dashboard
        </Link>{" "}
        for links to each editor.
      </p>
    </div>
  );
}
