"use client";

import { useState } from "react";
import type { FAQ } from "@/lib/museums";

export default function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {faqs.map((f, i) => {
        const open = openIndex === i;
        return (
          <div
            key={f.id || f.question}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-semibold text-[#2A302F] hover:text-[#2D903A] transition-colors"
            >
              <span className="text-[15px] sm:text-base font-semibold pr-2">
                {f.question}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs transition-transform duration-200 ${
                  open ? "rotate-180 text-[#2D903A]" : "text-[#7A7A7A]"
                }`}
              >
                ▼
              </span>
            </button>
            {open && (
              <div
                className="rich-content border-t border-gray-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-[#54595F]"
                dangerouslySetInnerHTML={{ __html: f.answer }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
