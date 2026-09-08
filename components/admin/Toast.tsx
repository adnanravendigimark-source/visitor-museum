"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// A dependency-free toast notification system (no react-toastify or similar
// installed) — matches RichTextEditor.tsx and CropModal.tsx's existing
// zero-dependency approach elsewhere in the admin. Wrap any part of the
// admin tree in <ToastProvider> (already done once, in AdminShell) and call
// useToast().showToast("success" | "error", message) from anywhere below it.

type ToastType = "success" | "error";
type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{
  showToast: (type: ToastType, message: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail soft rather than crash a component that renders outside the
    // provider — toasts just silently no-op instead of throwing.
    return { showToast: () => {} };
  }
  return ctx;
}

let nextId = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed top-5 right-5 z-[100] flex w-full max-w-md flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex animate-[toast-in_0.2s_ease-out] items-start gap-3 rounded-xl border px-5 py-4 text-base font-medium shadow-lg ${
              t.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-lg">{t.type === "success" ? "✓" : "!"}</span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-current/50 hover:text-current"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
