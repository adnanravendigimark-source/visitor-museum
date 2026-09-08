"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAGE_KEYS, PAGE_LABELS, type PageKey } from "@/lib/pageAccess";
import PasswordStrengthField from "./PasswordStrengthField";
import { useToast } from "./Toast";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

export default function UserForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"editor" | "admin">("editor");
  const [pages, setPages] = useState<PageKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  function togglePage(key: PageKey) {
    setPages((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  }

  function validatePw(v: string) {
    if (v && v.length < 8) {
      setPwError("Must be at least 8 characters.");
    } else {
      setPwError("");
    }
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 14; i++) generated += chars[Math.floor(Math.random() * chars.length)];
    setPassword(generated);
    setPwError("");
  }

  const dirty = !!email || !!password || role !== "editor" || pages.length > 0;

  function handleCancel() {
    if (dirty && !window.confirm("Discard this new user?")) return;
    setEmail("");
    setPassword("");
    setRole("editor");
    setPages([]);
    setPwError("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (role === "editor" && pages.length === 0) {
      setError("Select at least one page this editor can access.");
      return;
    }
    if (password.length < 8) {
      setPwError("Must be at least 8 characters.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, pages }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      const msg = data.error || "Could not create user.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    setEmail("");
    setPassword("");
    setRole("editor");
    setPages([]);
    showToast("success", "User created.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="writer@example.com"
          />
        </div>
        <div className="sm:col-span-1">
          <div className="mb-1 flex items-center justify-between">
            <label className={labelClass} style={{ marginBottom: 0 }}>Password</label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs font-medium text-canal-blue hover:underline"
            >
              Generate
            </button>
          </div>
          <PasswordStrengthField
            label=""
            value={password}
            onChange={(v) => {
              setPassword(v);
              validatePw(v);
            }}
            placeholder="At least 8 characters"
            required
            showStrength
            error={pwError}
          />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "editor" | "admin")} className={inputClass}>
            <option value="editor">Editor — view &amp; edit only</option>
            <option value="admin">Admin — full access</option>
          </select>
        </div>
      </div>

      {role === "editor" && (
        <div>
          <label className={labelClass}>Which pages can they access?</label>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {PAGE_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-1.5 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={pages.includes(key)}
                  onChange={() => togglePage(key)}
                  className="h-[18px] w-[18px] rounded border-stone-300 text-canal-orange focus:ring-canal-blue"
                />
                {PAGE_LABELS[key]}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            They'll only see and be able to edit the sections checked above — everything else stays
            hidden from their admin sidebar.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !dirty || !!pwError}
          className="rounded-lg bg-canal-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-primary/90 disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create User"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
