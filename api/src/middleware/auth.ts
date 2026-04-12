import { createMiddleware } from "hono/factory";
import crypto from "node:crypto";

interface SessionPayload {
  email: string;
  admin: boolean;
  exp: number;
}

const COOKIE_NAME = "mossbrain_session";

function getSecret(): string {
  return process.env.SESSION_SECRET!;
}

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("base64url");
}

export function createSessionCookie(email: string, admin: boolean): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ email, admin, exp } satisfies SessionPayload);
  const sig = sign(payload);
  const value = `${Buffer.from(payload).toString("base64url")}.${sig}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${7 * 24 * 3600}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseSession(cookieHeader: string | undefined): SessionPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  const value = match.slice(COOKIE_NAME.length + 1);
  const dotIdx = value.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const encodedPayload = value.slice(0, dotIdx);
  const sig = value.slice(dotIdx + 1);

  if (sign(Buffer.from(encodedPayload, "base64url").toString()) !== sig) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString()
    );
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const cookie = c.req.header("Cookie");
  const session = parseSession(cookie);
  c.set("isAdmin", session?.admin ?? false);
  c.set("userEmail", session?.email ?? "");
  await next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
