"use client";

import { useRef, useState } from "react";
import CropModal from "./CropModal";
import MediaLibraryModal from "./MediaLibraryModal";
import { useToast } from "./Toast";
import { recordMediaUrl } from "@/lib/mediaClient";

export interface ImageModalData {
  url: string;
  alt: string;
  caption: string;
}

// The upload/crop/edit device for images inserted inline inside rich text.
// Supports both inserting new images and editing existing images (alt text, caption, URL, crop, delete).
export default function RichImageModal({
  initialValues,
  isEditing = false,
  onInsert,
  onDelete,
  onClose,
}: {
  initialValues?: ImageModalData;
  isEditing?: boolean;
  onInsert: (opts: ImageModalData) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialValues?.url || "");
  const [alt, setAlt] = useState(initialValues?.alt || "");
  const [caption, setCaption] = useState(initialValues?.caption || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<{ file: File; url: string } | null>(null);
  const [recropSrc, setRecropSrc] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function upload(file: File | Blob, name = "image.jpg") {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file, file instanceof File ? file.name : name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Upload failed.";
        setError(msg);
        showToast("error", msg);
      } else {
        setUrl(data.url);
        showToast("success", "Image uploaded.");
      }
    } catch {
      const msg = "Upload failed. Please try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelected(file: File) {
    setPendingFile({ file, url: URL.createObjectURL(file) });
  }

  function closePendingFile() {
    if (pendingFile) URL.revokeObjectURL(pendingFile.url);
    setPendingFile(null);
  }

  function handleCropConfirm(blob: Blob) {
    closePendingFile();
    upload(blob, "cropped.jpg");
  }

  function handleCropUseOriginal() {
    if (!pendingFile) return;
    const file = pendingFile.file;
    closePendingFile();
    upload(file);
  }

  function handleRecropConfirm(blob: Blob) {
    setRecropSrc(null);
    upload(blob, "cropped.jpg");
  }

  function handleLibrarySelect(selectedUrl: string) {
    setUrl(selectedUrl);
    setLibraryOpen(false);
  }

  function handleSave() {
    if (!url) {
      showToast("error", "Add an image first — upload a file or paste a URL.");
      return;
    }
    onInsert({ url, alt, caption });
    recordMediaUrl(url);
    showToast("success", isEditing ? "Image updated." : "Image inserted.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            {isEditing ? "Edit Image Details" : "Insert image"}
          </h3>
          {isEditing && (
            <span className="rounded-full bg-canal-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-canal-blue">
              Editing Image
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {isEditing
            ? "Update the alt text (for SEO), caption, or replace the photo."
            : "Choose from the Media Library, upload a photo from your device, or paste an image URL."}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://... or upload a file"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
          />
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="shrink-0 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = "";
            }}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

        {url && (
          <div className="mt-3 flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Preview"
              className="h-28 min-w-0 flex-1 rounded-lg border border-stone-200 object-cover"
            />
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setRecropSrc(url)}
                className="whitespace-nowrap rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Adjust crop
              </button>
              <button
                type="button"
                onClick={() => setUrl("")}
                className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Change photo
              </button>
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-stone-700">
            Alt text <span className="text-stone-400">(important for SEO &amp; Google Images)</span>
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describe what is shown in the image (e.g. The Louvre glass pyramid at dusk)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-stone-700">
            Caption <span className="text-stone-400">(optional, displayed under the image)</span>
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Shown under the photo on the article"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-canal-blue focus:outline-none focus:ring-1 focus:ring-canal-blue"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove from Article
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!url || uploading}
              className="rounded-lg bg-canal-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-canal-blue/90 shadow-sm disabled:opacity-60"
            >
              {isEditing ? "Save changes" : "Insert image"}
            </button>
          </div>
        </div>
      </div>

      {pendingFile && (
        <CropModal
          src={pendingFile.url}
          aspectRatio={16 / 9}
          onCancel={closePendingFile}
          onConfirm={handleCropConfirm}
          onUseOriginal={handleCropUseOriginal}
        />
      )}
      {recropSrc && (
        <CropModal
          src={recropSrc}
          aspectRatio={16 / 9}
          onCancel={() => setRecropSrc(null)}
          onConfirm={handleRecropConfirm}
        />
      )}
      {libraryOpen && (
        <MediaLibraryModal onSelect={handleLibrarySelect} onClose={() => setLibraryOpen(false)} />
      )}
    </div>
  );
}
