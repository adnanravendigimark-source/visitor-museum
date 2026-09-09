export default function QuickAnswer({
  children,
  label = "Quick Answer",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div id="quick-answer" className="mt-6 flex scroll-mt-24 gap-3.5 rounded-2xl border border-[#ECE8DE] bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF8F5] p-6 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B85D3E]/10 text-lg">
        💡
      </div>
      <div>
        <p className="font-blog-display text-xs font-bold uppercase tracking-wider text-[#B85D3E]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-[#112338]">{children}</p>
      </div>
    </div>
  );
}
