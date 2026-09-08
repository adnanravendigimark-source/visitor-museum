"use client";

import { ICON_OPTIONS, getIconComponent } from "@/lib/iconMap";

export { ICON_OPTIONS, getIconComponent };

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const Selected = getIconComponent(value);
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-stone-50 text-stone-700">
        <Selected className="h-4 w-4" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
      >
        {Object.keys(ICON_OPTIONS).map((key) => (
          <option key={key} value={key}>
            {key.replace(/Icon$/, "")}
          </option>
        ))}
      </select>
    </div>
  );
}
