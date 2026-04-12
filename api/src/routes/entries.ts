import { Hono } from "hono";
import { db } from "../db/index.js";
import { entries, media, entryLabels, labels } from "../db/schema.js";
import { eq, desc, and, or, lt, sql, inArray } from "drizzle-orm";
import { getPublicUrl } from "../lib/storage.js";
import type {
  EntryResponse,
  MediaResponse,
  PaginatedResponse,
} from "../types.js";

type Env = {
  Variables: {
    isAdmin: boolean;
    userEmail: string;
  };
};

const app = new Hono<Env>();

const PAGE_SIZE = 30;

function buildMediaResponse(
  m: { id: string; storageKey: string; width: number | null; height: number | null; sortOrder: number }
): MediaResponse {
  return {
    id: m.id,
    url: getPublicUrl(m.storageKey),
    width: m.width,
    height: m.height,
    sort_order: m.sortOrder,
  };
}

async function loadEntryResponse(
  entryRows: (typeof entries.$inferSelect)[],
  isAdmin: boolean
): Promise<EntryResponse[]> {
  if (entryRows.length === 0) return [];

  const ids = entryRows.map((e) => e.id);

  const [mediaRows, labelRows] = await Promise.all([
    db
      .select()
      .from(media)
      .where(inArray(media.entryId, ids))
      .orderBy(media.sortOrder),
    db
      .select({ entryId: entryLabels.entryId, name: labels.name })
      .from(entryLabels)
      .innerJoin(labels, eq(entryLabels.labelId, labels.id))
      .where(inArray(entryLabels.entryId, ids)),
  ]);

  const mediaByEntry = new Map<string, typeof mediaRows>();
  for (const m of mediaRows) {
    const arr = mediaByEntry.get(m.entryId) ?? [];
    arr.push(m);
    mediaByEntry.set(m.entryId, arr);
  }

  const labelsByEntry = new Map<string, string[]>();
  for (const l of labelRows) {
    const arr = labelsByEntry.get(l.entryId) ?? [];
    arr.push(l.name);
    labelsByEntry.set(l.entryId, arr);
  }

  return entryRows.map((e) => ({
    id: e.id,
    published_at: e.publishedAt.toISOString(),
    visibility: e.visibility,
    body:
      e.visibility === "private" && !isAdmin ? null : e.body,
    media: (mediaByEntry.get(e.id) ?? []).map(buildMediaResponse),
    labels: labelsByEntry.get(e.id) ?? [],
  }));
}

app.get("/", async (c) => {
  const isAdmin = c.get("isAdmin");
  const cursor = c.req.query("cursor");
  const labelFilter = c.req.query("label");
  const visibilityFilter = c.req.query("visibility");

  const conditions = [];

  if (cursor) {
    const [ts, id] = cursor.split("_");
    const cursorDate = new Date(ts);
    conditions.push(
      or(
        lt(entries.publishedAt, cursorDate),
        and(eq(entries.publishedAt, cursorDate), lt(entries.id, id))
      )
    );
  }

  if (visibilityFilter && isAdmin) {
    conditions.push(eq(entries.visibility, visibilityFilter as "public" | "private"));
  }

  let query;
  if (labelFilter) {
    const sub = db
      .select({ entryId: entryLabels.entryId })
      .from(entryLabels)
      .innerJoin(labels, eq(entryLabels.labelId, labels.id))
      .where(eq(labels.name, labelFilter));

    conditions.push(inArray(entries.id, sub));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(entries)
    .where(where)
    .orderBy(desc(entries.publishedAt), desc(entries.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  let nextCursor: string | null = null;
  if (hasMore) {
    const last = page[page.length - 1];
    nextCursor = `${last.publishedAt.toISOString()}_${last.id}`;
  }

  const items = await loadEntryResponse(page, isAdmin);

  return c.json({
    items,
    next_cursor: nextCursor,
    has_more: hasMore,
  } satisfies PaginatedResponse<EntryResponse>);
});

app.get("/media-sample", async (c) => {
  const rows = await db
    .select({
      id: media.id,
      entryId: media.entryId,
      storageKey: media.storageKey,
      width: media.width,
      height: media.height,
    })
    .from(media)
    .innerJoin(entries, eq(media.entryId, entries.id))
    .where(eq(entries.visibility, "public"))
    .orderBy(desc(media.createdAt))
    .limit(200);

  return c.json(
    rows.map((r) => ({
      id: r.id,
      entry_id: r.entryId,
      url: getPublicUrl(r.storageKey),
      width: r.width,
      height: r.height,
    }))
  );
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const isAdmin = c.get("isAdmin");

  const row = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);

  if (row.length === 0) {
    return c.json({ error: "Not found" }, 404);
  }

  const [item] = await loadEntryResponse(row, isAdmin);
  return c.json(item);
});

export default app;
