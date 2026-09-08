"use client";

// A save-button bar that sticks to the bottom of the admin content area
// while its form is in view, so the primary action is reachable without
// scrolling to the end of a long form. Uses `position: sticky` (scoped to
// the nearest scrolling ancestor — the admin content column in
// AdminShell.tsx, or a modal's own scroll box) rather than `fixed`, so it
// never paints over the sidebar and works correctly inside modals too.
export default function SaveBar({
  saving,
  disabled = false,
  label = "Save Changes",
  savingLabel = "Saving…",
  onCancel,
  cancelLabel = "Cancel",
  note,
}: {
  saving: boolean;
  disabled?: boolean;
  label?: string;
  savingLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  note?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border-t border-stone-200 bg-white/95 px-4 py-3.5 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
      <p className="text-xs text-stone-500">{note}</p>
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={saving || disabled}
          className="rounded-lg bg-canal-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-primary/90 disabled:opacity-60"
        >
          {saving ? savingLabel : label}
        </button>
      </div>
    </div>
  );
}
