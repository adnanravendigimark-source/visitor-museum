"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { FAQ } from "@/lib/museums";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";

export default function MuseumFaqsForm({ museumId, initial }: { museumId: string; initial: FAQ[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(i: number, field: keyof FAQ, value: string) {
    const next = [...faqs];
    next[i] = { ...next[i], [field]: value };
    setFaqs(next);
  }

  function addFaq() {
    setFaqs([...faqs, { question: "", answer: "" }]);
  }

  function removeFaq(i: number) {
    setFaqs(faqs.filter((_, idx) => idx !== i));
  }

  const dirty = useMemo(() => JSON.stringify(faqs) !== JSON.stringify(initial), [faqs, initial]);

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setFaqs(initial);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/museums/${museumId}/faqs`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqs.filter((f) => f.question.trim() && f.answer.trim())),
    });
    setSaving(false);
    if (!res.ok) {
      const msg = "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live on the museum's FAQ section now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {faqs.map((faq, i) => (
        <div key={faq.id || i} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">FAQ {i + 1}</span>
            <button type="button" onClick={() => removeFaq(i)} className="text-xs font-medium text-red-600 hover:text-red-700">
              Remove
            </button>
          </div>
          <input
            value={faq.question}
            onChange={(e) => update(i, "question", e.target.value)}
            placeholder="Question"
            className={`${inputClass} mb-2`}
          />
          <RichTextEditor
            value={faq.answer}
            onChange={(html) => update(i, "answer", html)}
            placeholder="Answer"
            minHeight="4rem"
            allowedHeadings={[]}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addFaq}
        className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
      >
        + Add FAQ
      </button>

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
