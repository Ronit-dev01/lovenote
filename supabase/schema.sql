-- lovenote · Supabase schema
-- Run this once in your project's SQL editor (Dashboard → SQL → New query).
-- Then copy your project URL + secret key into .env.local

create table if not exists public.pages (
  id                 text primary key,
  slug               text unique not null,
  edit_key_hash      text not null,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  occasion           text not null default 'just-because',
  theme              text not null default 'blush',
  recipient          text not null default '',
  sender             text not null default '',
  title              text not null default '',
  subtitle           text not null default '',
  letter_title       text not null default '',
  letter_body        text not null default '',
  signature          text not null default '',
  ps                 text not null default '',
  song_url           text not null default '',
  song_label         text not null default '',
  special_date       date,
  special_date_label text not null default '',
  photos             jsonb not null default '[]'::jsonb,
  views              integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists pages_slug_idx on public.pages (slug);

-- Lock the table down completely. All reads and writes go through the
-- Next.js server using the secret key, which bypasses RLS. The browser never
-- touches the database directly, so page edit keys can never be stolen.
alter table public.pages enable row level security;

-- Public bucket for photos. Photos are only discoverable through a page link,
-- because every path contains a random id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lovenote-photos',
  'lovenote-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
