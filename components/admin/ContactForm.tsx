"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IconPicker from "./IconPicker";
import SeoFieldsCard from "./SeoFieldsCard";
import RichTextEditor from "./RichTextEditor";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";
import type { ContactPageContent, ContactReason } from "@/lib/contact";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="font-semibold text-stone-900">{title}</p>
      {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </div>
  );
}

export default function ContactForm({ initial }: { initial: ContactPageContent }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [contact, setContact] = useState<ContactPageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => JSON.stringify(contact) !== JSON.stringify(initial), [contact, initial]);

  function update<K extends keyof ContactPageContent>(key: K, value: ContactPageContent[K]) {
    setContact((c) => ({ ...c, [key]: value }));
  }

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setContact(initial);
    setError("");
  }

  function updateReason(i: number, patch: Partial<ContactReason>) {
    const next = [...contact.reasons];
    next[i] = { ...next[i], ...patch };
    update("reasons", next);
  }

  function addReason() {
    update("reasons", [...contact.reasons, { icon: "MailIcon", title: "", body: "" }]);
  }

  function removeReason(i: number) {
    update("reasons", contact.reasons.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = data.error || "Save failed. Please try again.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    showToast("success", "Saved — live at /contact now.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <SectionCard title="Hero">
        <div>
          <label className={labelClass}>Eyebrow label</label>
          <input value={contact.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} className={inputClass} placeholder="Contact" />
        </div>
        <div>
          <label className={labelClass}>Heading (H1)</label>
          <input value={contact.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Subheading</label>
          <RichTextEditor value={contact.heroSubheading} onChange={(html) => update("heroSubheading", html)} minHeight="3rem" allowedHeadings={[]} />
        </div>
      </SectionCard>

      <SectionCard title="Email card">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Label above the email</label>
            <input value={contact.emailLabel} onChange={(e) => update("emailLabel", e.target.value)} className={inputClass} placeholder="Email Us Directly" />
          </div>
          <div>
            <label className={labelClass}>Contact email</label>
            <input type="email" required value={contact.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Note under the email</label>
            <input value={contact.emailNote} onChange={(e) => update("emailNote", e.target.value)} className={inputClass} placeholder="We typically reply within 1–2 business days." />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="What we can help with" description="The 3 icon cards under the email.">
        <div>
          <label className={labelClass}>Section heading</label>
          <input value={contact.reasonsHeading} onChange={(e) => update("reasonsHeading", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-3">
          {contact.reasons.map((reason, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Card {i + 1}</span>
                <button type="button" onClick={() => removeReason(i)} className="text-xs text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <IconPicker value={reason.icon} onChange={(icon) => updateReason(i, { icon })} />
                <input
                  value={reason.title}
                  onChange={(e) => updateReason(i, { title: e.target.value })}
                  className={inputClass}
                  placeholder="Card title"
                />
                <RichTextEditor
                  value={reason.body}
                  onChange={(html) => updateReason(i, { body: html })}
                  minHeight="3rem"
                  allowedHeadings={[]}
                  placeholder="Card body text"
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addReason} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-stone-100">
          + Add card
        </button>
      </SectionCard>

      <SectionCard title="Footer note & CTA">
        <div>
          <label className={labelClass}>Footer note</label>
          <RichTextEditor value={contact.footerNote} onChange={(html) => update("footerNote", html)} minHeight="3rem" allowedHeadings={[]} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>CTA heading</label>
            <input value={contact.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CTA button label</label>
            <input value={contact.ctaButtonLabel} onChange={(e) => update("ctaButtonLabel", e.target.value)} className={inputClass} />
          </div>
        </div>
      </SectionCard>

      <SeoFieldsCard
        showMeta
        pathHint="/contact"
        value={{
          metaTitle: contact.metaTitle,
          metaDescription: contact.metaDescription,
          canonicalUrl: contact.canonicalUrl,
          noIndex: contact.noIndex,
          noFollow: contact.noFollow,
          ogTitle: contact.ogTitle,
          ogDescription: contact.ogDescription,
          ogImage: contact.ogImage,
        }}
        onChange={(patch) => setContact((c) => ({ ...c, ...patch }))}
      />

      <SaveBar saving={saving} disabled={!dirty} onCancel={handleCancel} />
    </form>
  );
}
