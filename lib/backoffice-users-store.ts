import { getSql } from "./database";
import { hashPassword, verifyPassword, type BackofficeRole, type BackofficeUser } from "./backoffice-users";

const store = globalThis as unknown as { __buddylifeUsersReady?: Promise<void> };
const COLUMNS = `id, username, role, active, created_at AS "createdAt", last_login_at AS "lastLoginAt"`;

function ensureTable() {
  if (!store.__buddylifeUsersReady) {
    store.__buddylifeUsersReady = (async () => {
      await getSql()`
        CREATE TABLE IF NOT EXISTS backoffice_users (
          id UUID PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
          active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        )
      `;
    })().catch((error) => {
      store.__buddylifeUsersReady = undefined;
      throw error;
    });
  }
  return store.__buddylifeUsersReady;
}

function toUser(row: Record<string, unknown>): BackofficeUser {
  const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : value ? new Date(String(value)).toISOString() : null);
  return { id: String(row.id), username: String(row.username), role: row.role as BackofficeRole, active: Boolean(row.active), createdAt: iso(row.createdAt) || "", lastLoginAt: iso(row.lastLoginAt) };
}

export async function listUsers(): Promise<BackofficeUser[]> {
  await ensureTable();
  const rows = await getSql().query(`SELECT ${COLUMNS} FROM backoffice_users ORDER BY created_at`);
  return rows.map(toUser);
}

export async function createUser(username: string, password: string, role: BackofficeRole): Promise<BackofficeUser | null> {
  await ensureTable();
  const sql = getSql();
  const existing = await sql`SELECT id FROM backoffice_users WHERE username = ${username} LIMIT 1`;
  if (existing.length) return null;
  const rows = await sql.query(`INSERT INTO backoffice_users (id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`, [crypto.randomUUID(), username, hashPassword(password), role]);
  return toUser(rows[0]);
}

export async function updateUser(id: string, patch: { password?: string; role?: BackofficeRole; active?: boolean }): Promise<BackofficeUser | null> {
  await ensureTable();
  const sql = getSql();
  if (patch.password !== undefined) await sql`UPDATE backoffice_users SET password_hash = ${hashPassword(patch.password)} WHERE id = ${id}`;
  if (patch.role !== undefined) await sql`UPDATE backoffice_users SET role = ${patch.role} WHERE id = ${id}`;
  if (patch.active !== undefined) await sql`UPDATE backoffice_users SET active = ${patch.active} WHERE id = ${id}`;
  const rows = await sql.query(`SELECT ${COLUMNS} FROM backoffice_users WHERE id = $1`, [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

/** Login check for database accounts. Returns the user when the password matches an active account. */
export async function authenticateUser(username: string, password: string): Promise<BackofficeUser | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    await ensureTable();
    const sql = getSql();
    const rows = await sql.query(`SELECT ${COLUMNS}, password_hash AS "passwordHash" FROM backoffice_users WHERE username = $1 AND active LIMIT 1`, [username]);
    const row = rows[0];
    if (!row || !verifyPassword(password, String(row.passwordHash))) return null;
    await sql`UPDATE backoffice_users SET last_login_at = NOW() WHERE id = ${String(row.id)}`;
    return toUser(row);
  } catch {
    return null;
  }
}
