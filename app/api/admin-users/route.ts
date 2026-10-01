import { cookies } from "next/headers";
import { readBackofficeSession } from "../../../lib/backoffice-auth";
import { isBackofficeRole, normalizeUsername, passwordProblem, validUsername } from "../../../lib/backoffice-users";
import { createUser, listUsers, updateUser } from "../../../lib/backoffice-users-store";
import { logEvent } from "../../../lib/logging";
import { isUuid } from "../../../lib/qr-attribution";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };

// The middleware already keeps editors out; this is the second lock on the same door.
async function ownerOnly() {
  const session = readBackofficeSession((await cookies()).get("buddylife_backoffice")?.value);
  return session?.role === "owner" ? session : null;
}

export async function GET() {
  if (!(await ownerOnly())) return Response.json({ error: "Owner access required" }, { status: 403 });
  try {
    return Response.json({ users: await listUsers() }, { headers: NO_STORE });
  } catch (error) {
    logEvent("error", "/api/admin-users", "Users could not be loaded", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Accounts are temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const owner = await ownerOnly();
  if (!owner) return Response.json({ error: "Owner access required" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const action = String(body.action || "");
  try {
    if (action === "create") {
      const username = normalizeUsername(body.username);
      if (!validUsername(username)) return Response.json({ error: "Use 3–40 lowercase letters, digits, dots, dashes or underscores for the login" }, { status: 400 });
      if (username === "owner") return Response.json({ error: "That login is reserved" }, { status: 400 });
      const problem = passwordProblem(body.password);
      if (problem) return Response.json({ error: problem }, { status: 400 });
      const role = isBackofficeRole(body.role) ? body.role : "editor";
      const user = await createUser(username, String(body.password), role);
      if (!user) return Response.json({ error: "An account with that login already exists" }, { status: 409 });
      logEvent("info", "/api/admin-users", "Account created", { username, role, by: owner.user });
      return Response.json({ ok: true, user }, { status: 201 });
    }
    if (action === "update") {
      const id = String(body.id || "");
      if (!isUuid(id)) return Response.json({ error: "Invalid account identity" }, { status: 400 });
      const patch: { password?: string; role?: "owner" | "editor"; active?: boolean } = {};
      if (body.password !== undefined) {
        const problem = passwordProblem(body.password);
        if (problem) return Response.json({ error: problem }, { status: 400 });
        patch.password = String(body.password);
      }
      if (body.role !== undefined) {
        if (!isBackofficeRole(body.role)) return Response.json({ error: "Unknown role" }, { status: 400 });
        patch.role = body.role;
      }
      if (typeof body.active === "boolean") patch.active = body.active;
      const user = await updateUser(id, patch);
      if (!user) return Response.json({ error: "Account not found" }, { status: 404 });
      logEvent("info", "/api/admin-users", "Account updated", { username: user.username, changed: Object.keys(patch).filter((key) => key !== "password"), passwordChanged: patch.password !== undefined, by: owner.user });
      return Response.json({ ok: true, user });
    }
    return Response.json({ error: "Unsupported account action" }, { status: 400 });
  } catch (error) {
    logEvent("error", "/api/admin-users", "Account change failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "The account could not be saved" }, { status: 503 });
  }
}
