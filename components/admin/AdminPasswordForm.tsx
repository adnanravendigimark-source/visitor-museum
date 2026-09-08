"use client";

import { useState } from "react";
import PasswordStrengthField, { calcStrength } from "./PasswordStrengthField";
import SaveBar from "./SaveBar";
import { useToast } from "./Toast";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

export default function AdminPasswordForm() {
  const { showToast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newPwError, setNewPwError] = useState("");
  const [confirmPwError, setConfirmPwError] = useState("");

  function validateNewPw(v: string) {
    if (v && v.length < 8) {
      setNewPwError("Must be at least 8 characters.");
    } else {
      setNewPwError("");
    }
    if (confirmPw && v !== confirmPw) {
      setConfirmPwError("Passwords do not match.");
    } else if (confirmPw) {
      setConfirmPwError("");
    }
  }

  function validateConfirmPw(v: string) {
    if (v && v !== newPw) {
      setConfirmPwError("Passwords do not match.");
    } else {
      setConfirmPwError("");
    }
  }

  const dirty = !!currentPw || !!newPw || !!confirmPw;

  function handleCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setNewPwError("");
    setConfirmPwError("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPw.length < 8) {
      setNewPwError("Must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setConfirmPwError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      const msg = data.error || "Save failed.";
      setError(msg);
      showToast("error", msg);
      return;
    }

    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    showToast("success", "Password updated — your new password is active immediately.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className={labelClass} htmlFor="current-pw">
          Current password
        </label>
        <div className="relative">
          <input
            id="current-pw"
            type="password"
            required
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Enter your current password"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
      </div>

      <PasswordStrengthField
        id="new-pw"
        label="New password"
        value={newPw}
        onChange={(v) => {
          setNewPw(v);
          validateNewPw(v);
        }}
        placeholder="At least 8 characters"
        required
        showStrength
        error={newPwError}
      />

      <PasswordStrengthField
        id="confirm-pw"
        label="Confirm new password"
        value={confirmPw}
        onChange={(v) => {
          setConfirmPw(v);
          validateConfirmPw(v);
        }}
        placeholder="Re-enter new password"
        required
        showStrength={false}
        error={confirmPwError}
      />

      <p className="text-xs text-stone-500">
        Tips: mix upper &amp; lowercase letters, numbers, and symbols for a stronger password.
      </p>

      <SaveBar
        saving={saving}
        disabled={!dirty || !!newPwError || !!confirmPwError}
        onCancel={handleCancel}
        label="Update password"
      />
    </form>
  );
}
