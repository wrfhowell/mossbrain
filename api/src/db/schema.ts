import {
  pgTable,
  text,
  timestamp,
  bigint,
  integer,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

export const entries = pgTable(
  "entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    source: text("source").default("telegram").notNull(),
    telegramChatId: bigint("telegram_chat_id", { mode: "bigint" }),
    telegramMessageId: bigint("telegram_message_id", { mode: "bigint" }),
    visibility: text("visibility", { enum: ["public", "private"] })
      .default("public")
      .notNull(),
    body: text("body").notNull(),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("uq_telegram_msg").on(
      table.telegramChatId,
      table.telegramMessageId
    ),
    index("idx_entries_published_at").on(table.publishedAt),
  ]
);

export const media = pgTable(
  "media",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    entryId: text("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    filename: text("filename"),
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    sortOrder: integer("sort_order").default(0).notNull(),
    telegramFileId: text("telegram_file_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_media_entry_id").on(table.entryId)]
);

export const labels = pgTable("labels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const entryLabels = pgTable(
  "entry_labels",
  {
    entryId: text("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.labelId] })]
);

export const visitorNotes = pgTable("visitor_notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  body: text("body").notNull(),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const entriesRelations = relations(entries, ({ many }) => ({
  media: many(media),
  entryLabels: many(entryLabels),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  entry: one(entries, { fields: [media.entryId], references: [entries.id] }),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  entryLabels: many(entryLabels),
}));

export const entryLabelsRelations = relations(entryLabels, ({ one }) => ({
  entry: one(entries, {
    fields: [entryLabels.entryId],
    references: [entries.id],
  }),
  label: one(labels, {
    fields: [entryLabels.labelId],
    references: [labels.id],
  }),
}));
