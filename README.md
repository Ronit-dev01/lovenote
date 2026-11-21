# lovenote

A little website builder for people in love.

Pick an occasion, write the letter, drop in your photos, publish — and send one
link. Good for apologies, anniversaries, birthdays, long-distance nights, or a
Tuesday that needs no reason at all.

```
┌─────────────────────────────────────────────────────────────┐
│  create  →  live preview  →  publish  →  /s/your-slug       │
│  no login        as you type        one link     envelope   │
└─────────────────────────────────────────────────────────────┘
```

## What's inside

- **An editor that feels like writing.** Occasion presets, a letter with real
  paragraphs, photo captions, a date counter, "our song", and four hand-tuned
  themes. A live preview sits beside it the whole time.
- **An opening envelope.** The public page starts closed. Your person taps it
  and the letter unfolds.
- **Private editing, no accounts.** Each page gets a secret edit key stored in
  your browser. Share the page link; keep the edit link.
- **A dashboard** at `/dashboard` listing your pages, their views, and a way to
  restore a page from an edit link on another device.
- **Two storage modes.** Runs out of the box on local disk, and switches to
  Supabase (database + photo storage) the moment you add keys.

## Run it right now (local mode)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything is saved in `.data/` on this computer —
no account, no setup. Photos go to `.data/uploads/`.

In local mode, pages survive restarts but only exist on this machine. To share
them with the world, add Supabase below.

## Go live with Supabase (free)

1. Create a project at [supabase.com](https://supabase.com) — the free tier is
   plenty for personal pages.
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `pages` table and a public `lovenote-photos` storage bucket.
3. Open **Project Settings → API keys** and copy:
   - the **Project URL**
   - the **secret key** (`sb_secret_…`) — *not* the publishable/anon key
4. Create `.env.local` in the project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

5. Restart `npm run dev`. The editor banner will disappear — uploads and pages
   now live in Supabase.

> **Why the secret key?** All database access happens on the server. The table
> has RLS enabled with zero policies, so nothing can read or write it with a
> browser key. Edit keys are stored only as SHA-256 hashes, and verified
> server-side on every change.

Older Supabase projects use `SUPABASE_SERVICE_ROLE_KEY` instead of
`SUPABASE_SECRET_KEY`; both are supported.

## Deploying

Any Node host works — Vercel is the easiest:

1. Push this folder to a GitHub repo.
2. Import it on Vercel.
3. Add the three environment variables above.
4. Set `NEXT_PUBLIC_SITE_URL` to your real domain, then redeploy.

Photo uploads go straight from the server to Supabase Storage, so no extra
config is needed.

## How it fits together

```
app/
  page.tsx              landing page
  create/               the editor (new page)
  edit/[slug]/          the editor (existing page, unlock with edit key)
  s/[slug]/             the public page
  dashboard/            your pages, stored in localStorage
  example/              a complete sample page
api/
  pages/                create, read, update, delete (edit-key protected)
  upload/               image upload → local disk or Supabase Storage
  media/[...key]/       serves local-mode images
lib/
  store.ts              storage interface + backend selection
  local-store.ts        JSON file + disk storage (demo mode)
  supabase-store.ts     Postgres + Storage (live mode)
  validate.ts           input cleaning for everything that crosses the wire
  auth.ts               edit key generation, hashing, constant-time compare
components/
  Editor.tsx            the whole authoring experience
  PageView.tsx          the public page / envelope / gallery
supabase/schema.sql     run once in Supabase
```

## Small notes

- Photos are resized in the browser to max 1800px before upload, so phone
  pictures stay sharp without being 8MB.
- Drafts are hidden from the public. Unpublishing a page turns its link back
  into "not quite ready".
- Deleting a page also deletes its photos.
- The edit key lives in `localStorage`. Clearing site data loses it — that's
  what the "copy edit link" button in the editor is for.
