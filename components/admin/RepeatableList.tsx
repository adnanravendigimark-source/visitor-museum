"use client";

// Generic add/remove/reorder list editor — used for every repeatable
// admin field on the homepage (nav links, footer columns, tour timeline
// rows, bullet lists, image galleries, opening hours). Keeps the same
// interaction pattern everywhere: a card per row with Up/Down/Remove
// controls and an "+ Add" button, so a non-technical editor only has to
// learn this once.
export default function RepeatableList<T>({
  items,
  onChange,
  newItem,
  renderItem,
  addLabel = "+ Add",
  emptyLabel = "Nothing added yet.",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  // Receives the *whole* updated item (not a partial patch) — works
  // uniformly whether T is a primitive (string) or an object shape.
  renderItem: (item: T, update: (next: T) => void, index: number) => React.ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}) {
  function updateAt(i: number, next: T) {
    const copy = [...items];
    copy[i] = next;
    onChange(copy);
  }

  function removeAt(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function moveAt(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200">
              #{i + 1}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button type="button" onClick={() => moveAt(i, -1)} disabled={i === 0} className="text-stone-500 hover:text-stone-900 disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => moveAt(i, 1)} disabled={i === items.length - 1} className="text-stone-500 hover:text-stone-900 disabled:opacity-30">
                ↓
              </button>
              <button type="button" onClick={() => removeAt(i)} className="text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
          {renderItem(item, (next) => updateAt(i, next), i)}
        </div>
      ))}
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs text-stone-500">
          {emptyLabel}
        </p>
      )}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
      >
        {addLabel}
      </button>
    </div>
  );
}
