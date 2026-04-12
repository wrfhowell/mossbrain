import { Hono } from "hono";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { visitorNotes } from "../db/schema.js";
import { desc } from "drizzle-orm";
import type { VisitorNoteResponse } from "../types.js";

const app = new Hono();

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateLimitMap = new Map<string, number[]>();

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [key, timestamps] of rateLimitMap) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, filtered);
    }
  }
}, 5 * 60 * 1000);

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header("X-Forwarded-For")?.split(",")[0].trim() ??
    c.req.header("X-Real-IP") ??
    "unknown"
  );
}

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(visitorNotes)
    .orderBy(desc(visitorNotes.createdAt))
    .limit(50);

  const items: VisitorNoteResponse[] = rows.map((r) => ({
    id: r.id,
    body: r.body,
    created_at: r.createdAt.toISOString(),
  }));

  return c.json(items);
});

app.post("/", async (c) => {
  const raw = c.req.header("Content-Type")?.includes("application/json")
    ? await c.req.json()
    : null;

  if (!raw || typeof raw.body !== "string") {
    return c.json({ error: "body is required" }, 400);
  }

  const body = raw.body.trim();
  if (body.length === 0 || body.length > 280) {
    return c.json(
      { error: "body must be between 1 and 280 characters" },
      400
    );
  }

  const ip = getClientIp(c);
  const ipHash = hashIp(ip);

  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const timestamps = rateLimitMap.get(ipHash) ?? [];
  const recent = timestamps.filter((t) => t > cutoff);

  if (recent.length >= RATE_LIMIT) {
    return c.json({ error: "Rate limit exceeded. Max 5 notes per hour." }, 429);
  }

  recent.push(now);
  rateLimitMap.set(ipHash, recent);

  const [note] = await db
    .insert(visitorNotes)
    .values({ body, ipHash })
    .returning();

  return c.json(
    {
      id: note.id,
      body: note.body,
      created_at: note.createdAt.toISOString(),
    } satisfies VisitorNoteResponse,
    201
  );
});

export default app;
