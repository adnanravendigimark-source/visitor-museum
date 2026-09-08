import { sql } from "./db";
import { hashPassword, verifyPassword } from "./passwords";
import { PAGE_KEYS, type PageKey } from "./pageAccess";

export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  pages: PageKey[];
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  pages: PageKey[];
  createdAt: string;
}

function toSafe({ passwordHash, ...rest }: User): SafeUser {
  return rest;
}

function normalizePages(role: UserRole, pages: PageKey[]): PageKey[] {
  if (role === "admin") return [...PAGE_KEYS];
  const valid = pages.filter((p) => (PAGE_KEYS as readonly string[]).includes(p));
  return Array.from(new Set(valid));
}

function parsePagesColumn(value: unknown): PageKey[] {
  if (Array.isArray(value)) return value as PageKey[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as PageKey[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToUser(row: any): User {
  const pages = parsePagesColumn(row.pages);
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    pages: row.role === "admin" ? [...PAGE_KEYS] : pages,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function getUsers(): Promise<User[]> {
  try {
    const rows = await sql`SELECT * FROM users ORDER BY created_at ASC`;
    return rows.map(rowToUser);
  } catch {
    return [];
  }
}

export async function getSafeUsers(): Promise<SafeUser[]> {
  return (await getUsers()).map(toSafe);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const rows = await sql`SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1`;
  return rows.length ? rowToUser(rows[0]) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return rows.length ? rowToUser(rows[0]) : undefined;
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  pages: PageKey[]
): Promise<SafeUser> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }
  const passwordHash = hashPassword(password);
  const normalizedPages = normalizePages(role, pages);
  const rows = await sql`
    INSERT INTO users (email, password_hash, role, pages)
    VALUES (${email}, ${passwordHash}, ${role}, ${JSON.stringify(normalizedPages)}::jsonb)
    RETURNING *
  `;
  return toSafe(rowToUser(rows[0]));
}

export async function updateUser(
  id: string,
  updates: { email?: string; role?: UserRole; pages?: PageKey[]; password?: string }
): Promise<SafeUser> {
  const current = await findUserById(id);
  if (!current) throw new Error("User not found.");

  const nextEmail = (updates.email || current.email).trim();
  if (nextEmail.toLowerCase() !== current.email.toLowerCase()) {
    const clash = await findUserByEmail(nextEmail);
    if (clash) throw new Error("A user with this email already exists.");
  }
  const nextRole = updates.role || current.role;
  const nextPages = normalizePages(nextRole, updates.pages ?? current.pages);
  const nextPasswordHash = updates.password ? hashPassword(updates.password) : current.passwordHash;

  const rows = await sql`
    UPDATE users
    SET email = ${nextEmail},
        role = ${nextRole},
        pages = ${JSON.stringify(nextPages)}::jsonb,
        password_hash = ${nextPasswordHash}
    WHERE id = ${id}
    RETURNING *
  `;
  return toSafe(rowToUser(rows[0]));
}

export async function deleteUser(id: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function verifyUserCredentials(email: string, password: string): Promise<SafeUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return toSafe(user);
}
