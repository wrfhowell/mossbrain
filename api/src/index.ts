import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import path from "path";
import { fileURLToPath } from "url";
import { sessionMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import entriesRoutes from "./routes/entries.js";
import telegramRoutes from "./routes/telegram.js";
import visitorNotesRoutes from "./routes/visitor-notes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, "../../web/dist");

type Env = {
  Variables: {
    isAdmin: boolean;
    userEmail: string;
  };
};

const app = new Hono<Env>();

app.use(
  "*",
  cors({
    origin: process.env.PUBLIC_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use("*", sessionMiddleware);

// Opt every response (pages, images, API JSON) out of AI training; see also web/public/robots.txt
app.use("*", async (c, next) => {
  await next();
  c.header("X-Robots-Tag", "noai, noimageai");
});

app.route("/api/entries", entriesRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/telegram", telegramRoutes);
app.route("/api/visitor-notes", visitorNotesRoutes);

app.get("/api/health", (c) => c.json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
  app.use("*", serveStatic({ root: webDist }));
  app.get("*", serveStatic({ root: webDist, path: "index.html" }));
}

const port = Number(process.env.PORT ?? 3000);
console.log(`stone wizard api listening on port ${port}`);
serve({ fetch: app.fetch, port });
