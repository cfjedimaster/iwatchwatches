# I Watch Watches

A watch-focused RSS aggregator built with Astro 7, Netlify, and Netlify Database.

## Stack

- **Astro 7** (SSR) with the Netlify adapter
- **Netlify Database** (Postgres) via Drizzle ORM
- **Scheduled Netlify Function** that syncs feeds once a day
- Vanilla JS for light/dark theme persistence

## Setup

```bash
npm install
```

Initialize the local Netlify Database and apply migrations:

```bash
npx netlify database init --yes
npm run db:migrate
```

If the project is already linked and `@netlify/database` is installed, you can skip `init` and just apply migrations.

## Local development

For first-time setup, initialize the local database, apply its migrations, and start Netlify’s local environment:

```bash
npx netlify database init --yes
npm run db:migrate
npx netlify dev
```

Then open the printed local URL (default `http://localhost:8888`).

In another terminal, run a one-off feed sync to populate the database:

```bash
curl http://localhost:8888/.netlify/functions/update-feeds
```

On subsequent runs, `npx netlify dev` is sufficient unless new migrations need to be applied.

## Database

Schema lives in [`src/db/schema.ts`](src/db/schema.ts). Migrations live in [`netlify/database/migrations/`](netlify/database/migrations/).

```bash
npm run db:generate   # create a migration from schema changes
npm run db:migrate    # apply pending migrations to the local DB only
```

Hosted databases (preview + production) receive migrations automatically on deploy. Do not run migrations against `NETLIFY_DB_URL` yourself.

Starter feeds are seeded by migration `20260723203300_seed_feeds`.

## Configuration

- [`src/config.ts`](src/config.ts) — `ITEMS_PER_PAGE` (default `10`) and site metadata
- [`src/data/feeds.json`](src/data/feeds.json) — reference copy of the starter feed list
- Theme preference is stored in `localStorage` under `iwatchwatches-theme`

Search is present in the UI but intentionally disabled for now; Algolia will be wired up later.

## Deploy

1. Link the site: `npx netlify link`
2. Deploy: `npx netlify deploy` or push to the connected Git remote
3. After the first production deploy, trigger a feed sync once if you want articles immediately:

```bash
curl https://YOUR-SITE.netlify.app/.netlify/functions/update-feeds
```

The scheduled function runs daily (`@daily`) and inserts new items by unique article URL.
