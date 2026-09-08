import { sql } from "./db";
import { hashPassword, verifyPassword } from "./passwords";

export async function getAdminPasswordHash(): Promise<string | null> {
  try {
    const rows = await sql`SELECT admin_password_hash FROM site_settings WHERE id = 1 LIMIT 1`;
    const hash = rows[0]?.admin_password_hash as string | null | undefined;
    return hash || null;
  } catch {
    return null;
  }
}

export async function setAdminPasswordHash(plainPassword: string): Promise<void> {
  const hash = hashPassword(plainPassword);
  await sql`
    INSERT INTO site_settings (id, admin_password_hash)
    VALUES (1, ${hash})
    ON CONFLICT (id) DO UPDATE SET admin_password_hash = EXCLUDED.admin_password_hash
  `;
}

export async function verifyOwnerPassword(candidate: string): Promise<boolean> {
  const dbHash = await getAdminPasswordHash();
  const envPw = process.env.ADMIN_PASSWORD;

  // Bug fixed here: this used to return as soon as a DB hash existed,
  // never even checking ADMIN_PASSWORD. That meant a stale hash saved
  // once through /admin/account (e.g. during earlier setup/testing) would
  // permanently shadow the env var - rotating ADMIN_PASSWORD in Vercel and
  // redeploying had no effect at all, silently locking the owner out with
  // their new password while the old one kept working. ADMIN_PASSWORD is
  // meant to be a break-glass credential the owner can always reset from
  // Vercel, so it must remain valid even after a DB hash has been set.
  if (dbHash && verifyPassword(candidate, dbHash)) return true;
  if (envPw && candidate === envPw) return true;

  return false;
}
