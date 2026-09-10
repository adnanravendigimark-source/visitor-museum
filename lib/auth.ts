import type { PageKey } from "./pageAccess";

// SECURITY: this used to fall back to a hardcoded string
// ("visit-museums-admin-session-secret-2026-secure") whenever
// ADMIN_SESSION_SECRET wasn't set. That string is sitting right here in
// the source, so anyone who ever saw this file could forge a signed,
// full-admin session token — a complete authentication bypass, silent and
// undetectable, on any deployment that forgot to set the real env var.
// There is no safe fallback for a signing secret: if it's missing, every
// route that needs a session must treat every token as invalid rather
// than accept one signed with a key an attacker could also know.
const SECRET = process.env.ADMIN_SESSION_SECRET || "";
export const ADMIN_COOKIE_NAME = "vm_admin_session";

// Sessions are bounded to this lifetime independent of the cookie's own
// maxAge (see the 8h cookie maxAge set on login) — this is what actually
// gets checked on every verify, so a captured/replayed token can't be used
// forever even if the cookie itself is copied out and resubmitted by hand.
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours, matches the login cookie's maxAge

export type SessionRole = "admin" | "editor";

export interface Session {
  email: string;
  role: SessionRole;
  pages: PageKey[];
}

interface SignedPayload extends Session {
  iat: number;
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

function requireSecretConfigured() {
  if (!SECRET) {
    // Logged, not thrown: throwing here would 500 every page load site-wide
    // (getSession() is called from middleware and layouts). Failing every
    // session check to "not logged in" is the correct closed state instead
    // — worst case is the admin can't log in until the env var is set,
    // which is loud and obvious, versus a forgeable fallback secret, which
    // is silent and catastrophic.
    console.error(
      "[auth] ADMIN_SESSION_SECRET is not set — refusing to create or verify admin sessions. Set a long random value for ADMIN_SESSION_SECRET in your environment."
    );
    return false;
  }
  return true;
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
  if (!requireSecretConfigured()) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  const withIat: SignedPayload = { ...session, iat: Date.now() };
  const payload = toBase64Url(JSON.stringify(withIat));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  if (!requireSecretConfigured()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await sign(payload);
  if (expected !== sig) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<SignedPayload>;
    if (!parsed?.email || (parsed.role !== "admin" && parsed.role !== "editor")) return null;
    // Bound how long a signed token stays usable, independent of the
    // cookie's own maxAge — see SESSION_TTL_MS above.
    if (typeof parsed.iat !== "number" || Date.now() - parsed.iat > SESSION_TTL_MS) return null;
    const pages = Array.isArray(parsed.pages) ? (parsed.pages as PageKey[]) : [];
    return { email: parsed.email, role: parsed.role, pages };
  } catch {
    return null;
  }
}
