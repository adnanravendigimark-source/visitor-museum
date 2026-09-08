import { sql } from "./db";
import type { ContentBlock } from "./posts";
import privacyPolicySeed from "@/data/privacy-policy.json";

export interface PrivacyPolicy {
  title: string;
  lastUpdated?: string;
  lastUpdatedLabel: string;
  emptyStateText: string;
  content: ContentBlock[];
  noIndex: boolean;
  noFollow: boolean;
  canonicalUrl: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

function parseContent(value: unknown): ContentBlock[] {
  if (Array.isArray(value)) return value as ContentBlock[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const DEFAULT_PRIVACY_POLICY: PrivacyPolicy = {
  title: (privacyPolicySeed as any).title || "Privacy Policy & Terms",
  lastUpdated: new Date().toISOString().slice(0, 10),
  lastUpdatedLabel: "Last updated: ",
  emptyStateText: "This page hasn't been filled in yet.",
  content: ((privacyPolicySeed as any).sections || []).map((s: any) => ({
    type: "paragraph" as const,
    text: `<h3>${s.heading}</h3><p>${s.content}</p>`,
  })),
  noIndex: false,
  noFollow: false,
  canonicalUrl: "",
  metaTitle: "Privacy Policy | Visit Museums",
  metaDescription: "Privacy Policy for Visit Museums — how we protect your information when comparing museum and attraction tickets worldwide.",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

export async function getPrivacyPolicy(): Promise<PrivacyPolicy> {
  try {
    const rows = await sql`SELECT * FROM privacy_policy WHERE id = 1 LIMIT 1`;
    if (!rows.length) return DEFAULT_PRIVACY_POLICY;
    const row = rows[0] as any;
    return {
      title: row.title || DEFAULT_PRIVACY_POLICY.title,
      lastUpdated: row.last_updated
        ? new Date(row.last_updated).toISOString().slice(0, 10)
        : DEFAULT_PRIVACY_POLICY.lastUpdated,
      lastUpdatedLabel: row.last_updated_label || DEFAULT_PRIVACY_POLICY.lastUpdatedLabel,
      emptyStateText: row.empty_state_text || DEFAULT_PRIVACY_POLICY.emptyStateText,
      content: parseContent(row.content).length ? parseContent(row.content) : DEFAULT_PRIVACY_POLICY.content,
      noIndex: !!row.no_index,
      noFollow: !!row.no_follow,
      canonicalUrl: row.canonical_url || "",
      metaTitle: row.meta_title || DEFAULT_PRIVACY_POLICY.metaTitle,
      metaDescription: row.meta_description || DEFAULT_PRIVACY_POLICY.metaDescription,
      ogTitle: row.og_title || "",
      ogDescription: row.og_description || "",
      ogImage: row.og_image || "",
    };
  } catch {
    return DEFAULT_PRIVACY_POLICY;
  }
}

export async function savePrivacyPolicy(data: {
  title: string;
  lastUpdated?: string;
  lastUpdatedLabel?: string;
  emptyStateText?: string;
  content: ContentBlock[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}): Promise<void> {
  await sql`
    INSERT INTO privacy_policy (
      id, title, last_updated, last_updated_label, empty_state_text, content,
      meta_title, meta_description, canonical_url, no_index, no_follow,
      og_title, og_description, og_image
    ) VALUES (
      1, ${data.title},
      ${data.lastUpdated ? new Date(data.lastUpdated).toISOString() : new Date().toISOString()},
      ${data.lastUpdatedLabel || DEFAULT_PRIVACY_POLICY.lastUpdatedLabel},
      ${data.emptyStateText || DEFAULT_PRIVACY_POLICY.emptyStateText},
      ${JSON.stringify(data.content || [])}::jsonb,
      ${data.metaTitle || ""}, ${data.metaDescription || ""}, ${data.canonicalUrl || ""},
      ${!!data.noIndex}, ${!!data.noFollow},
      ${data.ogTitle || ""}, ${data.ogDescription || ""}, ${data.ogImage || ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      last_updated = EXCLUDED.last_updated,
      last_updated_label = EXCLUDED.last_updated_label,
      empty_state_text = EXCLUDED.empty_state_text,
      content = EXCLUDED.content,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      canonical_url = EXCLUDED.canonical_url,
      no_index = EXCLUDED.no_index,
      no_follow = EXCLUDED.no_follow,
      og_title = EXCLUDED.og_title,
      og_description = EXCLUDED.og_description,
      og_image = EXCLUDED.og_image
  `;
}

export async function setPrivacyIndexing(noIndex: boolean, noFollow: boolean): Promise<void> {
  await sql`
    INSERT INTO privacy_policy (id, no_index, no_follow)
    VALUES (1, ${!!noIndex}, ${!!noFollow})
    ON CONFLICT (id) DO UPDATE SET
      no_index = EXCLUDED.no_index,
      no_follow = EXCLUDED.no_follow
  `;
}
