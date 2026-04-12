import { Hono } from "hono";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { visitorNotes } from "../db/schema.js";
import { desc, eq, count, gte, and } from "drizzle-orm";
import type { VisitorNoteResponse } from "../types.js";

const app = new Hono();

const MAX_PER_IP_PER_DAY = 2;
const MAX_GLOBAL_PER_DAY = 25;

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function getClientIp(c: {
  req: { header: (name: string) => string | undefined };
}): string {
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
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [[ipCount], [globalCount]] = await Promise.all([
    db
      .select({ n: count() })
      .from(visitorNotes)
      .where(
        and(eq(visitorNotes.ipHash, ipHash), gte(visitorNotes.createdAt, dayAgo))
      ),
    db
      .select({ n: count() })
      .from(visitorNotes)
      .where(gte(visitorNotes.createdAt, dayAgo)),
  ]);

  if (ipCount.n >= MAX_PER_IP_PER_DAY) {
    return c.json(
      { error: "Rate limit exceeded. Max 2 notes per day." },
      429
    );
  }

  if (globalCount.n >= MAX_GLOBAL_PER_DAY) {
    return c.json(
      { error: "Daily note limit reached. Please try again tomorrow." },
      429
    );
  }

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
