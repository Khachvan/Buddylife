// Backoffice accounts stored in the database. The owner login from the environment always works
// and is the only way in before the first user exists.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type BackofficeRole = "owner" | "editor";
export const BACKOFFICE_ROLES: readonly BackofficeRole[] = ["owner", "editor"];

export type BackofficeUser = { id: string; username: string; role: BackofficeRole; active: boolean; createdAt: string; lastLoginAt: string | null };

const USERNAME = /^[a-z0-9][a-z0-9._-]{2,39}$/;
export const MIN_PASSWORD_LENGTH = 12;

export function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validUsername(value: string) {
  return USERNAME.test(value);
}

export function passwordProblem(value: unknown): string | null {
  if (typeof value !== "string" || value.length < MIN_PASSWORD_LENGTH) return `Use a password of at least ${MIN_PASSWORD_LENGTH} characters`;
  if (value.length > 200) return "The password is too long";
  return null;
}

export function isBackofficeRole(value: unknown): value is BackofficeRole {
  return value === "owner" || value === "editor";
}

/** scrypt with a per-password salt: "scrypt$<salt>$<hash>", both base64url. */
export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const expected = Buffer.from(hash, "base64url");
    const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** What each role may open. Owners can do everything; editors cannot manage users or the database. */
const OWNER_ONLY = ["/admin/users", "/api/admin-users", "/admin/database", "/api/admin-database"];

export function roleAllows(role: BackofficeRole, path: string) {
  if (role === "owner") return true;
  return !OWNER_ONLY.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
