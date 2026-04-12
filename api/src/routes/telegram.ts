import { Hono } from "hono";
import { db } from "../db/index.js";
import { entries, media, labels, entryLabels } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { downloadFile } from "../lib/telegram.js";
import { uploadFile, generateKey } from "../lib/storage.js";

const app = new Hono();

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TelegramPhoto[];
  date: number;
}

interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

function parseMessageText(raw: string): {
  body: string;
  visibility: "public" | "private";
  publishedAt: Date | null;
  labelNames: string[];
} {
  let text = raw;
  let visibility: "public" | "private" = "public";
  let publishedAt: Date | null = null;

  if (/^#private\b/i.test(text)) {
    visibility = "private";
    text = text.replace(/^#private\s*/i, "");
  }

  const dateMatch = text.match(
    /^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\s*\|\s*/
  );
  if (dateMatch) {
    const dateStr = dateMatch[2]
      ? `${dateMatch[1]}T${dateMatch[2]}:00Z`
      : `${dateMatch[1]}T00:00:00Z`;
    publishedAt = new Date(dateStr);
    text = text.slice(dateMatch[0].length);
  }

  const labelNames: string[] = [];
  const tagRegex = /#(\w+)/g;
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    labelNames.push(match[1].toLowerCase());
  }
  text = text.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();

  return { body: text, visibility, publishedAt, labelNames };
}

async function ensureLabels(names: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (names.length === 0) return result;

  for (const name of names) {
    const existing = await db
      .select()
      .from(labels)
      .where(eq(labels.name, name))
      .limit(1);

    if (existing.length > 0) {
      result.set(name, existing[0].id);
    } else {
      const id = nanoid();
      await db.insert(labels).values({ id, name });
      result.set(name, id);
    }
  }

  return result;
}

app.post("/webhook", async (c) => {
  const secret = c.req.header("X-Telegram-Bot-Api-Secret-Token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const update: TelegramUpdate = await c.req.json();
  const msg = update.message;
  if (!msg) return c.json({ ok: true });

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (String(msg.chat.id) !== adminChatId) {
    return c.json({ ok: true });
  }

  const rawText = msg.text ?? msg.caption ?? "";
  const { body, visibility, publishedAt, labelNames } =
    parseMessageText(rawText);
  const effectivePublishedAt =
    publishedAt ?? new Date(msg.date * 1000);

  const chatId = BigInt(msg.chat.id);
  const messageId = BigInt(msg.message_id);

  const existing = await db
    .select({ id: entries.id })
    .from(entries)
    .where(
      and(
        eq(entries.telegramChatId, chatId),
        eq(entries.telegramMessageId, messageId)
      )
    )
    .limit(1);

  let entryId: string;

  if (existing.length > 0) {
    entryId = existing[0].id;
    await db
      .update(entries)
      .set({
        body,
        visibility,
        publishedAt: effectivePublishedAt,
        rawPayload: update,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, entryId));
  } else {
    entryId = nanoid();
    await db.insert(entries).values({
      id: entryId,
      body,
      visibility,
      publishedAt: effectivePublishedAt,
      source: "telegram",
      telegramChatId: chatId,
      telegramMessageId: messageId,
      rawPayload: update,
    });
  }

  if (labelNames.length > 0) {
    const labelMap = await ensureLabels(labelNames);

    await db
      .delete(entryLabels)
      .where(eq(entryLabels.entryId, entryId));

    await db.insert(entryLabels).values(
      [...labelMap.values()].map((labelId) => ({
        entryId,
        labelId,
      }))
    );
  }

  if (msg.photo && msg.photo.length > 0) {
    const largest = msg.photo.reduce((a, b) =>
      (b.file_size ?? 0) > (a.file_size ?? 0) ? b : a
    );

    try {
      const buffer = await downloadFile(largest.file_id);
      const key = generateKey("media", `${largest.file_unique_id}.jpg`);
      await uploadFile(key, buffer, "image/jpeg");

      await db.insert(media).values({
        id: nanoid(),
        entryId,
        storageKey: key,
        filename: `${largest.file_unique_id}.jpg`,
        mimeType: "image/jpeg",
        width: largest.width,
        height: largest.height,
        sortOrder: 0,
        telegramFileId: largest.file_id,
      });
    } catch (err) {
      console.error("Failed to process photo:", err);
    }
  }

  return c.json({ ok: true });
});

export default app;
