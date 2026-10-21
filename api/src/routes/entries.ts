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

  const [mediaRows, labelRows, numberRows] = await Promise.all([
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
    db.execute<{ id: string; entry_number: string }>(sql`
      WITH numbered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY published_at ASC, id ASC) AS entry_number
        FROM entries
      )
      SELECT id, entry_number FROM numbered
      WHERE id IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})
    `),
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

  const numberByEntry = new Map<string, number>();
  for (const r of numberRows) {
    numberByEntry.set(r.id, Number(r.entry_number));
  }

  return entryRows.map((e) => ({
    id: e.id,
    entry_number: numberByEntry.get(e.id) ?? 0,
    published_at: e.publishedAt.toISOString(),
    visibility: e.visibility,
    body:
      e.visibility === "private" && !isAdmin ? null : e.body,
    media:
      e.visibility === "private" && !isAdmin
        ? []
        : (mediaByEntry.get(e.id) ?? []).map(buildMediaResponse),
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
    .orderBy(desc(entries.publishedAt), desc(entries.id));

  const items = await loadEntryResponse(rows, isAdmin);

  return c.json({
    items,
    next_cursor: null,
    has_more: false,
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
