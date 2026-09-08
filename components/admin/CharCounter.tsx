// Character counter with a recommended range — turns green inside the
// range, amber when close/over, red when way off, so a non-technical
// editor gets an at-a-glance signal without needing to know SEO best
// practices by heart.
export default function CharCounter({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  let color = "text-stone-400";
  let note = `Recommended: ${min}–${max} characters`;
  if (length === 0) {
    color = "text-stone-400";
  } else if (length < min) {
    color = "text-amber-600";
    note = `${min - length} more characters recommended`;
  } else if (length <= max) {
    color = "text-green-600";
    note = "Good length";
  } else {
    color = "text-red-600";
    note = `${length - max} characters over — may get cut off`;
  }
  return (
    <p className={`mt-1 text-xs ${color}`}>
      {length} characters · {note}
    </p>
  );
}
