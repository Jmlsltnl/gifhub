-- GifHub.App – Schema V2 Migration
-- Run this in the Supabase SQL Editor AFTER schema.sql

-- ───────────────────────────── Site Settings ─────────────────────────────
create table if not exists public.site_settings (
  key   text primary key,
  value jsonb not null default '""'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
create policy "Public read site_settings" on public.site_settings for select using (true);
create policy "Service write site_settings" on public.site_settings for insert with check (auth.role() = 'service_role');
create policy "Service update site_settings" on public.site_settings for update using (auth.role() = 'service_role');
create policy "Service delete site_settings" on public.site_settings for delete using (auth.role() = 'service_role');

-- Seed default settings
insert into public.site_settings (key, value) values
  ('site_name', '"GifHub"'::jsonb),
  ('site_tagline', '"Professional GIFs for Business"'::jsonb),
  ('logo_url', '""'::jsonb),
  ('primary_color', '"#6d28d9"'::jsonb),
  ('primary_color_dark', '"#a78bfa"'::jsonb),
  ('accent_color', '"#f4f4f5"'::jsonb),
  ('accent_color_dark', '"#27272a"'::jsonb),
  ('footer_text', '"© 2026 GifHub.App. All rights reserved."'::jsonb),
  ('adsense_client_id', '""'::jsonb),
  ('enabled_locales', '["en"]'::jsonb),
  ('default_locale', '"en"'::jsonb),
  ('seo_title', '"GifHub — Professional GIFs for Business Communication"'::jsonb),
  ('seo_description', '"Discover and share professional GIFs for Slack, Teams, and workplace communication."'::jsonb)
on conflict (key) do nothing;

-- ───────────────────────────── CMS Pages ─────────────────────────────────
create table if not exists public.pages (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  slug         text not null unique,
  body         text not null default '',
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.pages enable row level security;
create policy "Public read published pages" on public.pages for select using (is_published = true);
create policy "Service all pages" on public.pages for all using (auth.role() = 'service_role');

-- Seed default pages
insert into public.pages (title, slug, body, is_published) values
  ('About', 'about', '<h2>About GifHub</h2><p>GifHub.App is a professional GIF platform for businesses worldwide. Find the perfect reaction GIF for Slack, Teams, email, and presentations.</p>', true),
  ('Privacy Policy', 'privacy', '<h2>Privacy Policy</h2><p>Your privacy matters to us. This policy describes how we collect and use information.</p>', true),
  ('Terms of Service', 'terms', '<h2>Terms of Service</h2><p>By using GifHub.App, you agree to the following terms and conditions.</p>', true)
on conflict (slug) do nothing;

-- ───────────────────────────── GIF Likes (IP-based) ─────────────────────
create table if not exists public.gif_likes (
  id         uuid primary key default uuid_generate_v4(),
  gif_id     uuid not null references public.gifs(id) on delete cascade,
  ip_hash    text not null,
  created_at timestamptz not null default now(),
  unique(gif_id, ip_hash)
);

create index if not exists idx_gif_likes_gif on public.gif_likes(gif_id);
create index if not exists idx_gif_likes_ip on public.gif_likes(ip_hash);

alter table public.gif_likes enable row level security;
create policy "Public read gif_likes" on public.gif_likes for select using (true);
create policy "Public insert gif_likes" on public.gif_likes for insert with check (true);
create policy "Public delete gif_likes" on public.gif_likes for delete using (true);

-- ───────────────────────────── GIF Dedup Column ─────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gifs' and column_name = 'source_hash'
  ) then
    alter table public.gifs add column source_hash text unique;
  end if;
end $$;

create index if not exists idx_gifs_source_hash on public.gifs(source_hash);
