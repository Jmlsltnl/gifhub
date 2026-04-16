-- GifHub.App – Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to bootstrap the database.

-- ───────────────────────────── Extensions ─────────────────────────────
create extension if not exists "uuid-ossp";

-- ───────────────────────────── Categories ─────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── Subcategories ──────────────────────────
create table public.subcategories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index idx_subcategories_category on public.subcategories(category_id);

-- ───────────────────────────── GIFs ───────────────────────────────────
create table public.gifs (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text not null unique,
  source_url      text,
  storage_path    text,
  alt_text        text,
  views           int not null default 0,
  likes           int not null default 0,
  category_id     uuid references public.categories(id) on delete set null,
  subcategory_id  uuid references public.subcategories(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_gifs_category     on public.gifs(category_id);
create index idx_gifs_subcategory  on public.gifs(subcategory_id);
create index idx_gifs_created_at   on public.gifs(created_at desc);
create index idx_gifs_slug         on public.gifs(slug);

-- ───────────────────────────── Tags ───────────────────────────────────
create table public.tags (
  id   uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

-- ───────────────────────────── GIF ↔ Tags (M2M) ──────────────────────
create table public.gif_tags (
  gif_id uuid not null references public.gifs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (gif_id, tag_id)
);

create index idx_gif_tags_tag on public.gif_tags(tag_id);

-- ───────────────────────────── Row Level Security ─────────────────────
alter table public.categories    enable row level security;
alter table public.subcategories enable row level security;
alter table public.gifs          enable row level security;
alter table public.tags          enable row level security;
alter table public.gif_tags      enable row level security;

-- Public read access
create policy "Public read categories"    on public.categories    for select using (true);
create policy "Public read subcategories" on public.subcategories for select using (true);
create policy "Public read gifs"          on public.gifs          for select using (true);
create policy "Public read tags"          on public.tags          for select using (true);
create policy "Public read gif_tags"      on public.gif_tags      for select using (true);

-- Service-role write access (uses the service_role key which bypasses RLS,
-- but we define explicit policies for completeness)
create policy "Service insert categories"    on public.categories    for insert with check (auth.role() = 'service_role');
create policy "Service update categories"    on public.categories    for update using  (auth.role() = 'service_role');
create policy "Service insert subcategories" on public.subcategories for insert with check (auth.role() = 'service_role');
create policy "Service update subcategories" on public.subcategories for update using  (auth.role() = 'service_role');
create policy "Service insert gifs"          on public.gifs          for insert with check (auth.role() = 'service_role');
create policy "Service update gifs"          on public.gifs          for update using  (auth.role() = 'service_role');
create policy "Service insert tags"          on public.tags          for insert with check (auth.role() = 'service_role');
create policy "Service update tags"          on public.tags          for update using  (auth.role() = 'service_role');
create policy "Service insert gif_tags"      on public.gif_tags      for insert with check (auth.role() = 'service_role');
create policy "Service update gif_tags"      on public.gif_tags      for update using  (auth.role() = 'service_role');

-- ───────────────────────────── Seed: Categories & Subcategories ───────
insert into public.categories (name, slug, description) values
  ('Marketing',                    'marketing',       'GIFs for marketers, campaigns, and brand moments'),
  ('SaaS',                         'saas',            'Software-as-a-Service celebrations and struggles'),
  ('eCommerce',                    'ecommerce',       'Online retail wins, fails, and everything in between'),
  ('Fintech',                      'fintech',         'Financial technology reactions and milestones'),
  ('Human Resources',              'human-resources',  'HR, recruiting, onboarding, and people ops'),
  ('Product & Engineering',        'product-engineering', 'Shipping features, debugging, and sprint rituals'),
  ('Internal Team Communication',  'team-communication',  'Slack reactions, standup vibes, and remote work life');

-- Marketing subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('Campaign Launch',        'campaign-launch',       (select id from public.categories where slug = 'marketing')),
  ('Social Media Wins',      'social-media-wins',     (select id from public.categories where slug = 'marketing')),
  ('Brand Moments',          'brand-moments',         (select id from public.categories where slug = 'marketing')),
  ('Email Marketing',        'email-marketing',       (select id from public.categories where slug = 'marketing')),
  ('Influencer Collabs',     'influencer-collabs',    (select id from public.categories where slug = 'marketing')),
  ('Content Marketing',      'content-marketing',     (select id from public.categories where slug = 'marketing')),
  ('SEO & Growth',           'seo-growth',            (select id from public.categories where slug = 'marketing')),
  ('Webinar & Events',       'webinar-events',        (select id from public.categories where slug = 'marketing')),
  ('Customer Testimonials',  'customer-testimonials', (select id from public.categories where slug = 'marketing')),
  ('A/B Testing Wins',       'ab-testing-wins',       (select id from public.categories where slug = 'marketing'));

-- SaaS subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('We Hit Our MRR Goal!',      'mrr-goal',                (select id from public.categories where slug = 'saas')),
  ('Churn Reactions',            'churn-reactions',          (select id from public.categories where slug = 'saas')),
  ('Product Hunt Launch',        'product-hunt-launch',      (select id from public.categories where slug = 'saas')),
  ('Demo Day',                   'demo-day',                 (select id from public.categories where slug = 'saas')),
  ('Customer Onboarding',       'customer-onboarding',      (select id from public.categories where slug = 'saas')),
  ('Feature Request Overload',  'feature-request-overload', (select id from public.categories where slug = 'saas')),
  ('Pricing Page Drama',        'pricing-page-drama',       (select id from public.categories where slug = 'saas')),
  ('Integration Shipped',       'integration-shipped',      (select id from public.categories where slug = 'saas')),
  ('Support Ticket Wins',       'support-ticket-wins',      (select id from public.categories where slug = 'saas')),
  ('Annual Planning',           'annual-planning',          (select id from public.categories where slug = 'saas'));

-- eCommerce subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('Black Friday Madness',  'black-friday',          (select id from public.categories where slug = 'ecommerce')),
  ('Order Shipped!',        'order-shipped',         (select id from public.categories where slug = 'ecommerce')),
  ('Cart Abandonment',      'cart-abandonment',      (select id from public.categories where slug = 'ecommerce')),
  ('Product Launch',        'product-launch-ecom',   (select id from public.categories where slug = 'ecommerce')),
  ('Flash Sale Madness',    'flash-sale',            (select id from public.categories where slug = 'ecommerce')),
  ('Return & Refund',       'return-refund',         (select id from public.categories where slug = 'ecommerce')),
  ('Inventory Alerts',      'inventory-alerts',      (select id from public.categories where slug = 'ecommerce')),
  ('Customer Reviews',      'customer-reviews',      (select id from public.categories where slug = 'ecommerce')),
  ('Shipping Updates',      'shipping-updates',      (select id from public.categories where slug = 'ecommerce')),
  ('Loyalty & Rewards',     'loyalty-rewards',       (select id from public.categories where slug = 'ecommerce'));

-- Fintech subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('Funding Round',          'funding-round',         (select id from public.categories where slug = 'fintech')),
  ('Market Reactions',       'market-reactions',       (select id from public.categories where slug = 'fintech')),
  ('Compliance Vibes',       'compliance-vibes',       (select id from public.categories where slug = 'fintech')),
  ('IPO Reactions',          'ipo-reactions',          (select id from public.categories where slug = 'fintech')),
  ('Quarterly Earnings',     'quarterly-earnings',     (select id from public.categories where slug = 'fintech')),
  ('Crypto Moments',         'crypto-moments',         (select id from public.categories where slug = 'fintech')),
  ('Payment Processing',     'payment-processing',     (select id from public.categories where slug = 'fintech')),
  ('Audit Season',           'audit-season',           (select id from public.categories where slug = 'fintech')),
  ('Investor Relations',     'investor-relations',     (select id from public.categories where slug = 'fintech')),
  ('Risk & Fraud Alerts',   'risk-fraud-alerts',      (select id from public.categories where slug = 'fintech'));

-- HR subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('New Hire Welcome',       'new-hire-welcome',       (select id from public.categories where slug = 'human-resources')),
  ('Performance Review',     'performance-review',     (select id from public.categories where slug = 'human-resources')),
  ('Team Building',          'team-building',          (select id from public.categories where slug = 'human-resources')),
  ('Employee Appreciation',  'employee-appreciation',  (select id from public.categories where slug = 'human-resources')),
  ('Work Anniversary',       'work-anniversary',       (select id from public.categories where slug = 'human-resources')),
  ('Offboarding & Farewell', 'offboarding-farewell',   (select id from public.categories where slug = 'human-resources')),
  ('Training & Development', 'training-development',   (select id from public.categories where slug = 'human-resources')),
  ('Diversity & Inclusion',  'diversity-inclusion',    (select id from public.categories where slug = 'human-resources')),
  ('Benefits & Perks',       'benefits-perks',         (select id from public.categories where slug = 'human-resources')),
  ('Recruitment Wins',       'recruitment-wins',       (select id from public.categories where slug = 'human-resources'));

-- Product & Engineering subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('Feature Shipped!',       'feature-shipped',        (select id from public.categories where slug = 'product-engineering')),
  ('Bug Found in Prod',      'bug-in-prod',            (select id from public.categories where slug = 'product-engineering')),
  ('Sprint Retrospective',   'sprint-retro',           (select id from public.categories where slug = 'product-engineering')),
  ('Code Review',            'code-review',            (select id from public.categories where slug = 'product-engineering')),
  ('Deploy to Production',   'deploy-production',      (select id from public.categories where slug = 'product-engineering')),
  ('Incident Response',      'incident-response',      (select id from public.categories where slug = 'product-engineering')),
  ('Hackathon',              'hackathon',              (select id from public.categories where slug = 'product-engineering')),
  ('Tech Debt Payoff',       'tech-debt-payoff',       (select id from public.categories where slug = 'product-engineering')),
  ('QA & Testing',           'qa-testing',             (select id from public.categories where slug = 'product-engineering')),
  ('Architecture Decisions', 'architecture-decisions',  (select id from public.categories where slug = 'product-engineering'));

-- Team Communication subcategories (10)
insert into public.subcategories (name, slug, category_id) values
  ('Monday Morning',                       'monday-morning',       (select id from public.categories where slug = 'team-communication')),
  ('Friday Vibes',                          'friday-vibes',         (select id from public.categories where slug = 'team-communication')),
  ('Meeting Could''ve Been an Email',      'meeting-email',        (select id from public.categories where slug = 'team-communication')),
  ('All-Hands Meeting',                    'all-hands-meeting',    (select id from public.categories where slug = 'team-communication')),
  ('Standup Reactions',                     'standup-reactions',    (select id from public.categories where slug = 'team-communication')),
  ('Deadline Approaching',                 'deadline-approaching', (select id from public.categories where slug = 'team-communication')),
  ('Out of Office',                         'out-of-office',       (select id from public.categories where slug = 'team-communication')),
  ('Celebrations & Wins',                  'celebrations-wins',    (select id from public.categories where slug = 'team-communication')),
  ('Feedback & Kudos',                      'feedback-kudos',      (select id from public.categories where slug = 'team-communication')),
  ('Remote Work Life',                      'remote-work-life',    (select id from public.categories where slug = 'team-communication'));

-- ───────────────────────────── Storage Bucket ─────────────────────────
-- Run via Supabase Dashboard → Storage → New Bucket
-- Name: gifs-bucket | Public: true
