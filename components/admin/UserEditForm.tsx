"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAGE_KEYS, PAGE_LABELS, type PageKey } from "@/lib/pageAccess";
import type { SafeUser } from "@/lib/users";
import PasswordStrengthField from "./PasswordStrengthField";
import { useToast } from "./Toast";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

export default function UserEditForm({ user, onCancel }: { user: SafeUser; onCancel?: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<"editor" | "admin">(user.role);
  const [pages, setPages] = useState<PageKey[]>(user.pages);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  function togglePage(key: PageKey) {
    setPages((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  }

  function validatePw(v: string) {
    if (v && v.length < 8) {
      setPwError("Must be at least 8 characters.");
    } else {
      setPwError("");
    }
    if (confirmPassword && v !== confirmPassword) {
      setConfirmError("Passwords do not match.");
    } else if (confirmPassword) {
      setConfirmError("");
    }
  }

  function validateConfirm(v: string) {
    if (v && v !== password) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  }

  const dirty =
    email !== user.email ||
    role !== user.role ||
    JSON.stringify([...pages].sort()) !== JSON.stringify([...user.pages].sort()) ||
    !!password;

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setEmail(user.email);
    setRole(user.role);
    setPages(user.pages);
    setPassword("");
    setConfirmPassword("");
    setPwError("");
    setConfirmError("");
    setError("");
    if (onCancel) onCancel();
    else router.push("/admin/users");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (role === "editor" && pages.length === 0) {
      setError("Select at least one page this editor can access.");
      return;
    }

    if (password) {
      if (password.length < 8) {
        setPwError("Must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmError("Passwords do not match.");
        return;
      }
    }

    setSaving(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, pages, password: password || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      const msg = data.error || "Save failed.";
      setError(msg);
      showToast("error", msg);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setSaved(true);
    showToast("success", "Saved — they'll see these changes next time they log in.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Saved — they'll see these changes next time they log in.
        </p>
      )}

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as "editor" | "admin")} className={inputClass}>
          <option value="editor">Editor — view &amp; edit only</option>
          <option value="admin">Admin — full access</option>
        </select>
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
        </div>
      )}

      {/* Password reset section */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-stone-700">Reset password</p>
          <p className="text-xs text-stone-500 mt-0.5">Leave both fields blank to keep their current password.</p>
        </div>

        <PasswordStrengthField
          id={`edit-pw-${user.id}`}
          label="New password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            validatePw(v);
            if (!v) {
              setConfirmPassword("");
              setConfirmError("");
            }
          }}
          placeholder="Leave blank to keep current"
          showStrength
          error={pwError}
        />

        {password && (
          <PasswordStrengthField
            id={`edit-confirm-pw-${user.id}`}
            label="Confirm new password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              validateConfirm(v);
            }}
            placeholder="Re-enter new password"
            showStrength={false}
            error={confirmError}
          />
        )}
      </div>

      <div className="flex gap-3 border-t border-stone-200 pt-5">
        <button
          type="submit"
          disabled={saving || !dirty || !!pwError || !!confirmError}
          className="rounded-lg bg-canal-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-canal-primary/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
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
