export async function recordMediaUrl(url: string): Promise<void> {
  if (!/^https?:\/\//i.test(url)) return;
  try {
    await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // best-effort only
  }
}
