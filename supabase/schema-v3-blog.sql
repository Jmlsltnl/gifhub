-- GifHub.App – Schema V3: Blog System
-- Run this in the Supabase SQL Editor AFTER schema-v2.sql

-- ───────────────────────────── Blog Categories ─────────────────────────────
create table if not exists public.blog_categories (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null unique,
  slug             text not null unique,
  description      text,
  meta_title       text,
  meta_description text,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.blog_categories enable row level security;
create policy "Public read blog_categories" on public.blog_categories for select using (true);
create policy "Service write blog_categories" on public.blog_categories for all using (auth.role() = 'service_role');

-- ───────────────────────────── Blog Tags ───────────────────────────────────
create table if not exists public.blog_tags (
  id   uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

alter table public.blog_tags enable row level security;
create policy "Public read blog_tags" on public.blog_tags for select using (true);
create policy "Service write blog_tags" on public.blog_tags for all using (auth.role() = 'service_role');

-- ───────────────────────────── Blog Posts ───────────────────────────────────
create table if not exists public.blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  body             text not null default '',
  featured_image   text,
  status           text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  author           text not null default 'GifHub Team',
  reading_time     int not null default 1,
  meta_title       text,
  meta_description text,
  og_image         text,
  canonical_url    text,
  published_at     timestamptz,
  scheduled_at     timestamptz,
  is_featured      boolean not null default false,
  views            int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_published on public.blog_posts(published_at desc);
create index if not exists idx_blog_posts_created on public.blog_posts(created_at desc);

alter table public.blog_posts enable row level security;
create policy "Public read published blog_posts" on public.blog_posts for select using (status = 'published');
create policy "Service all blog_posts" on public.blog_posts for all using (auth.role() = 'service_role');

-- ───────────────────────────── Blog Post ↔ Categories (M2M) ────────────────
create table if not exists public.blog_post_categories (
  post_id     uuid not null references public.blog_posts(id) on delete cascade,
  category_id uuid not null references public.blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

create index if not exists idx_bpc_category on public.blog_post_categories(category_id);

alter table public.blog_post_categories enable row level security;
create policy "Public read blog_post_categories" on public.blog_post_categories for select using (true);
create policy "Service write blog_post_categories" on public.blog_post_categories for all using (auth.role() = 'service_role');

-- ───────────────────────────── Blog Post ↔ Tags (M2M) ─────────────────────
create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists idx_bpt_tag on public.blog_post_tags(tag_id);

alter table public.blog_post_categories enable row level security;
create policy "Public read blog_post_tags" on public.blog_post_tags for select using (true);
create policy "Service write blog_post_tags" on public.blog_post_tags for all using (auth.role() = 'service_role');

-- ───────────────────────────── Seed: Blog Categories ───────────────────────
insert into public.blog_categories (name, slug, description, meta_title, meta_description, sort_order) values
  ('GIF Culture',       'gif-culture',       'How GIFs shape modern workplace communication and culture',     'GIF Culture — GifHub Blog', 'Explore how GIFs are shaping business communication and workplace culture.', 1),
  ('Productivity',      'productivity',      'Tips and strategies for using GIFs to boost team productivity',  'Productivity Tips — GifHub Blog', 'Boost team productivity with the right GIFs at the right time.', 2),
  ('Marketing',         'marketing',         'GIF marketing strategies, campaigns, and brand storytelling',    'Marketing with GIFs — GifHub Blog', 'Learn how to use GIFs in your marketing campaigns and brand storytelling.', 3),
  ('Remote Work',       'remote-work',       'Making remote and hybrid work more human with GIFs',            'Remote Work GIFs — GifHub Blog', 'How GIFs bridge the gap in remote and hybrid work environments.', 4),
  ('How-To Guides',     'how-to-guides',     'Step-by-step guides for using GIFs in business tools',          'How-To Guides — GifHub Blog', 'Step-by-step guides for using GIFs in Slack, Teams, Email, and more.', 5),
  ('Industry Trends',   'industry-trends',   'Trends in visual communication, GIFs, and business tech',       'Industry Trends — GifHub Blog', 'Stay ahead with the latest trends in visual communication and business technology.', 6)
on conflict (slug) do nothing;

-- ───────────────────────────── Seed: Blog Tags ─────────────────────────────
insert into public.blog_tags (name, slug) values
  ('Slack', 'slack'),
  ('Microsoft Teams', 'microsoft-teams'),
  ('Email', 'email'),
  ('Presentations', 'presentations'),
  ('Onboarding', 'onboarding'),
  ('Team Building', 'team-building'),
  ('Customer Support', 'customer-support'),
  ('Social Media', 'social-media'),
  ('SaaS', 'saas'),
  ('Startup', 'startup'),
  ('Enterprise', 'enterprise'),
  ('Communication', 'communication'),
  ('Branding', 'branding'),
  ('Employee Engagement', 'employee-engagement'),
  ('Leadership', 'leadership')
on conflict (slug) do nothing;
