"use client";

import { useRef, useState } from "react";

// Simple video field: paste a URL directly, or upload a file (stored in
// Vercel Blob by /api/admin/upload-video) which fills the URL in
// automatically. Deliberately not built on top of ImageUploadField — no
// crop step (cropping video isn't something CropModal supports), and no
// Media Library reuse (that library only lists images uploaded through
// the image endpoint). Used only by the hero background video field —
// see components/Hero.tsx and components/admin/HomepageForm.tsx.
export default function VideoUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const res = await fetch("/api/admin/upload-video", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload a video file"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-1 text-xs text-stone-500">
        MP4 or WebM, up to 40MB. Keep it short (10-20s) and it should loop cleanly — it plays muted,
        autoplaying, and on loop behind the hero text. Leave blank to use the hero image instead.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && (
        <div className="mt-2 flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-2.5">
          <video
            src={value}
            muted
            loop
            autoPlay
            playsInline
            className="h-28 min-w-0 flex-1 rounded-lg border border-stone-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Remove video
          </button>
        </div>
      )}
    </div>
  );
}
