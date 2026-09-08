import type { PageKey } from "./pageAccess";

const SECRET = process.env.ADMIN_SESSION_SECRET || "visit-museums-admin-session-secret-2026-secure";
export const ADMIN_COOKIE_NAME = "vm_admin_session";

export type SessionRole = "admin" | "editor";

export interface Session {
  email: string;
  role: SessionRole;
  pages: PageKey[];
}

async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toBase64Url(input: string | ArrayBuffer) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/"));
  return bin;
}

async function sign(payload: string) {
  const key = await getKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(sigBuf);
}

export async function createSessionToken(session: Session): Promise<string> {
  const payload = toBase64Url(JSON.stringify(session));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await sign(payload);
  if (expected !== sig) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    if (!parsed?.email || (parsed.role !== "admin" && parsed.role !== "editor")) return null;
    const pages = Array.isArray(parsed.pages) ? (parsed.pages as PageKey[]) : [];
    return { email: parsed.email, role: parsed.role, pages };
  } catch {
    return null;
  }
}
