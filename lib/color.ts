export function hexToRgbTriplet(hex: string): string | null {
  const trimmed = (hex || "").trim();
  const match = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(trimmed);
  if (!match) return null;
  let value = match[1];
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}
