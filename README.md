# mossbrain

A Telegram-synced personal transmission log. Send messages to a Telegram bot and they appear as entries on a single-page web app with an Obsidian-like timeline, dense photo mosaic, visitor notes, and parallax margin collage.

## Architecture

```
mossbrain/
├── api/          Hono API server (Node.js)
│   └── src/
│       ├── db/           Drizzle ORM schema + connection
│       ├── routes/       entries, auth, telegram webhook, visitor-notes
│       ├── middleware/   session auth (HMAC-signed cookies)
│       └── lib/          S3 storage, Telegram file helpers
├── web/          Vite + React 19 + Tailwind v4 SPA
│   └── src/
│       ├── components/   Feed, Entry, PhotoMosaic, Lightbox, MarginCollage, etc.
│       ├── pages/        HomePage, EntryPage (deep links)
│       ├── hooks/        useInfiniteScroll, useParallax
│       ├── context/      AuthContext (Google OAuth state)
│       └── lib/          API client
```

## Stack

- **API**: Hono + Node.js, Drizzle ORM, PostgreSQL
- **SPA**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **Auth**: Google OAuth 2.0 (PKCE) with httpOnly session cookies
- **Storage**: S3-compatible (Cloudflare R2 / AWS S3)
- **Ingest**: Telegram Bot webhook

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, TELEGRAM_BOT_TOKEN, GOOGLE_CLIENT_ID, etc.

npm install

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Dev (API on :3000, SPA on :5173 with proxy)
npm run dev
```

## Telegram Message Format

Messages sent to the bot become entries. Special prefixes:

- **Privacy**: Start with `#private` to hide from public viewers
- **Backdate**: Start with `2024-03-12 |` or `2024-03-12 09:15 |` to set a custom date
- **Labels**: Include `#hashtags` anywhere in the text
- **Photos**: Attach photos to include media

Example: `#private 2024-03-12 | Quiet morning at the lake #journal #nature`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/entries?cursor=&label=` | Paginated entries (cursor-based) |
| GET | `/api/entries/:id` | Single entry |
| GET | `/api/entries/media-sample` | Up to 200 photos for mosaic |
| GET | `/api/auth/login` | Redirect to Google OAuth |
| GET | `/api/auth/callback` | OAuth callback |
| GET | `/api/auth/me` | Current auth state |
| POST | `/api/auth/logout` | Clear session |
| POST | `/api/telegram/webhook` | Telegram webhook |
| GET | `/api/visitor-notes` | Recent 50 visitor notes |
| POST | `/api/visitor-notes` | Post a note (rate limited) |
| GET | `/api/health` | Health check |

## Environment Variables

See `.env.example` for all required configuration.
