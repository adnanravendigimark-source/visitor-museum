import { sql } from "./db";

export interface MediaItem {
  id: number;
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export async function recordMediaUpload(item: {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO media_library (url, filename, content_type, size_bytes)
      VALUES (${item.url}, ${item.filename}, ${item.contentType}, ${item.sizeBytes})
      ON CONFLICT (url) DO NOTHING
    `;
  } catch {
    // Fail soft
  }
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  try {
    const rows = await sql`
      SELECT id, url, filename, content_type, size_bytes, created_at
      FROM media_library
      ORDER BY created_at DESC
      LIMIT 300
    `;
    return rows.map((r) => ({
      id: r.id as number,
      url: r.url as string,
      filename: r.filename as string,
      contentType: r.content_type as string,
      sizeBytes: r.size_bytes as number,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : "",
    }));
  } catch {
    return [];
  }
}
