-- ─────────────────────────────────────────────────────────────
--  Run this once in Supabase → SQL Editor → New query → Run.
-- ─────────────────────────────────────────────────────────────

-- Games
create table if not exists public.games (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  title         text not null,
  description   text not null default '',
  category      text not null default 'Puzzle',
  tags          text[] not null default '{}',
  thumbnail_url text,
  html          text,          -- single-file game uploaded from the studio
  external_url  text,          -- or a link to a build hosted elsewhere
  has_html      boolean generated always as (html is not null) stored,
  publish_at    timestamptz not null default now(),
  is_published  boolean not null default true,
  plays         bigint not null default 0,
  created_at    timestamptz not null default now(),
  constraint game_has_source check (html is not null or external_url is not null)
);
create index if not exists games_publish_at_idx on public.games (publish_at desc);

-- Who may upload
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.games  enable row level security;
alter table public.admins enable row level security;

drop policy if exists "Visitors see live games" on public.games;
create policy "Visitors see live games" on public.games
  for select using (is_published and publish_at <= now());

drop policy if exists "Admins see everything" on public.games;
create policy "Admins see everything" on public.games
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins add games" on public.games;
create policy "Admins add games" on public.games
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins edit games" on public.games;
create policy "Admins edit games" on public.games
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete games" on public.games;
create policy "Admins delete games" on public.games
  for delete to authenticated using (public.is_admin());

drop policy if exists "Admins see own row" on public.admins;
create policy "Admins see own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Play counter (visitors can bump the count, nothing else)
create or replace function public.increment_plays(game_slug text) returns void
language sql security definer set search_path = public as $$
  update public.games set plays = plays + 1
  where slug = game_slug and is_published and publish_at <= now();
$$;
grant execute on function public.increment_plays(text) to anon, authenticated;

-- Cover images
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

drop policy if exists "Admins upload covers" on storage.objects;
create policy "Admins upload covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'thumbnails' and public.is_admin());

drop policy if exists "Admins replace covers" on storage.objects;
create policy "Admins replace covers" on storage.objects
  for update to authenticated using (bucket_id = 'thumbnails' and public.is_admin());

drop policy if exists "Admins remove covers" on storage.objects;
create policy "Admins remove covers" on storage.objects
  for delete to authenticated using (bucket_id = 'thumbnails' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
--  STEP 3b — after creating your login user, make it an admin.
--  Replace the ID with yours (Authentication → Users → copy User UID).
-- ─────────────────────────────────────────────────────────────
-- insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000000');
