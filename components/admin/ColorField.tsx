"use client";

// Hex color field with a native color-picker swatch and a live preview —
// used for the "Brand Colors" panel. Falls back to `fallback` (the site's
// original hardcoded hex) for the swatch/picker when the field is blank,
// so the picker never shows a broken/black color.
export default function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  const swatchValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-basilica-teal focus:outline-none focus:ring-1 focus:ring-basilica-teal"
        />
      </div>
    </div>
  );
}
