export default function QuickAnswer({
  children,
  label = "Quick Answer",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div id="quick-answer" className="mt-6 flex scroll-mt-24 gap-3.5 rounded-2xl border border-warmstone-300 bg-gradient-to-br from-warmstone-100/60 via-cream-50 to-warmstone-100/50 p-6 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-olive-100 text-lg">
        ⚔️
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-olive-800">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-charcoal-700">{children}</p>
      </div>
    </div>
  );
}
