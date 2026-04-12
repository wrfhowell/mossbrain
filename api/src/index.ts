import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { sessionMiddleware } from "./middleware/auth.js";
import entriesRoutes from "./routes/entries.js";
import authRoutes from "./routes/auth.js";
import telegramRoutes from "./routes/telegram.js";
import visitorNotesRoutes from "./routes/visitor-notes.js";

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
  })
);

app.use("*", sessionMiddleware);

app.route("/api/entries", entriesRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/telegram", telegramRoutes);
app.route("/api/visitor-notes", visitorNotesRoutes);

app.get("/api/health", (c) => c.json({ status: "ok" }));

if (process.env.NODE_ENV === "production") {
  app.use("*", serveStatic({ root: "../web/dist" }));
  app.get("*", serveStatic({ root: "../web/dist", path: "index.html" }));
}

const port = Number(process.env.PORT ?? 3000);
console.log(`mossbrain api listening on port ${port}`);
serve({ fetch: app.fetch, port });
