"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  textColor: string;
}

export function calcStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "", color: "bg-stone-200", textColor: "text-stone-400" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);

  const map: Record<number, Omit<PasswordStrength, "score">> = {
    0: { label: "Too short", color: "bg-red-400", textColor: "text-red-500" },
    1: { label: "Weak", color: "bg-red-400", textColor: "text-red-500" },
    2: { label: "Fair", color: "bg-orange-400", textColor: "text-orange-500" },
    3: { label: "Good", color: "bg-yellow-400", textColor: "text-yellow-600" },
    4: { label: "Strong", color: "bg-green-500", textColor: "text-green-600" },
  };

  return { score, ...map[score] };
}

interface Props {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
  error?: string;
  className?: string;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue";
const labelClass = "mb-1 block text-sm font-medium text-stone-700";

export default function PasswordStrengthField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  showStrength = true,
  error,
  className,
}: Props) {
  const [show, setShow] = useState(false);
  const strength = showStrength ? calcStrength(value) : null;

  return (
    <div className={className}>
      {label && (
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="new-password"
          className={`${inputClass} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-600"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value && strength && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= seg ? strength.color : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</p>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
