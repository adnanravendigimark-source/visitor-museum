export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractTableOfContents(html: string): { toc: TocItem[]; html: string } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const headingRe = /<h([23])((?:\s+[^>]*)?)>([\s\S]*?)<\/h\1>/gi;

  const withIds = (html || "").replace(headingRe, (match, levelStr, attrs, inner) => {
    const level: 2 | 3 = levelStr === "3" ? 3 : 2;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;

    let id = slugifyHeading(text) || `section-${toc.length + 1}`;
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    toc.push({ id, text, level });
    return `<h${level} id="${id}"${attrs || ""}>${inner}</h${level}>`;
  });

  return { toc, html: withIds };
}
