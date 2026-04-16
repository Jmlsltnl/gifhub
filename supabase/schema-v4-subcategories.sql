-- GifHub.App – Schema V4: Expanded Subcategories
-- Run this in the Supabase SQL Editor to add more subcategories.
-- Safe to run multiple times (uses ON CONFLICT).

-- ───────────────────── Marketing (6+ subcategories) ─────────────────────
insert into public.subcategories (name, slug, category_id) values
  ('Email Marketing',        'email-marketing',       (select id from public.categories where slug = 'marketing')),
  ('Influencer Collabs',     'influencer-collabs',    (select id from public.categories where slug = 'marketing')),
  ('Content Marketing',      'content-marketing',     (select id from public.categories where slug = 'marketing')),
  ('SEO & Growth',           'seo-growth',            (select id from public.categories where slug = 'marketing')),
  ('Webinar & Events',       'webinar-events',        (select id from public.categories where slug = 'marketing')),
  ('Customer Testimonials',  'customer-testimonials', (select id from public.categories where slug = 'marketing')),
  ('A/B Testing Wins',       'ab-testing-wins',       (select id from public.categories where slug = 'marketing'))
on conflict (slug) do nothing;

-- ───────────────────── SaaS (6+ subcategories) ──────────────────────────
insert into public.subcategories (name, slug, category_id) values
  ('Demo Day',               'demo-day',              (select id from public.categories where slug = 'saas')),
  ('Customer Onboarding',    'customer-onboarding',   (select id from public.categories where slug = 'saas')),
  ('Feature Request Overload','feature-request-overload',(select id from public.categories where slug = 'saas')),
  ('Pricing Page Drama',     'pricing-page-drama',    (select id from public.categories where slug = 'saas')),
  ('Integration Shipped',    'integration-shipped',   (select id from public.categories where slug = 'saas')),
  ('Support Ticket Wins',    'support-ticket-wins',   (select id from public.categories where slug = 'saas')),
  ('Annual Planning',        'annual-planning',       (select id from public.categories where slug = 'saas'))
on conflict (slug) do nothing;

-- ───────────────────── eCommerce (6+ subcategories) ─────────────────────
insert into public.subcategories (name, slug, category_id) values
  ('Product Launch',         'product-launch-ecom',   (select id from public.categories where slug = 'ecommerce')),
  ('Flash Sale Madness',     'flash-sale',            (select id from public.categories where slug = 'ecommerce')),
  ('Return & Refund',        'return-refund',         (select id from public.categories where slug = 'ecommerce')),
  ('Inventory Alerts',       'inventory-alerts',      (select id from public.categories where slug = 'ecommerce')),
  ('Customer Reviews',       'customer-reviews',      (select id from public.categories where slug = 'ecommerce')),
  ('Shipping Updates',       'shipping-updates',      (select id from public.categories where slug = 'ecommerce')),
  ('Loyalty & Rewards',      'loyalty-rewards',       (select id from public.categories where slug = 'ecommerce'))
on conflict (slug) do nothing;

-- ───────────────────── Fintech (6+ subcategories) ───────────────────────
insert into public.subcategories (name, slug, category_id) values
  ('IPO Reactions',          'ipo-reactions',         (select id from public.categories where slug = 'fintech')),
  ('Quarterly Earnings',     'quarterly-earnings',    (select id from public.categories where slug = 'fintech')),
  ('Crypto Moments',         'crypto-moments',        (select id from public.categories where slug = 'fintech')),
  ('Payment Processing',     'payment-processing',    (select id from public.categories where slug = 'fintech')),
  ('Audit Season',           'audit-season',          (select id from public.categories where slug = 'fintech')),
  ('Investor Relations',     'investor-relations',    (select id from public.categories where slug = 'fintech')),
  ('Risk & Fraud Alerts',    'risk-fraud-alerts',     (select id from public.categories where slug = 'fintech'))
on conflict (slug) do nothing;

-- ───────────────────── Human Resources (6+ subcategories) ───────────────
insert into public.subcategories (name, slug, category_id) values
  ('Employee Appreciation',  'employee-appreciation', (select id from public.categories where slug = 'human-resources')),
  ('Work Anniversary',       'work-anniversary',      (select id from public.categories where slug = 'human-resources')),
  ('Offboarding & Farewell', 'offboarding-farewell',  (select id from public.categories where slug = 'human-resources')),
  ('Training & Development', 'training-development',  (select id from public.categories where slug = 'human-resources')),
  ('Diversity & Inclusion',  'diversity-inclusion',   (select id from public.categories where slug = 'human-resources')),
  ('Benefits & Perks',       'benefits-perks',        (select id from public.categories where slug = 'human-resources')),
  ('Recruitment Wins',       'recruitment-wins',      (select id from public.categories where slug = 'human-resources'))
on conflict (slug) do nothing;

-- ───────────────────── Product & Engineering (6+ subcategories) ─────────
insert into public.subcategories (name, slug, category_id) values
  ('Code Review',            'code-review',           (select id from public.categories where slug = 'product-engineering')),
  ('Deploy to Production',   'deploy-production',     (select id from public.categories where slug = 'product-engineering')),
  ('Incident Response',      'incident-response',     (select id from public.categories where slug = 'product-engineering')),
  ('Hackathon',              'hackathon',             (select id from public.categories where slug = 'product-engineering')),
  ('Tech Debt Payoff',       'tech-debt-payoff',      (select id from public.categories where slug = 'product-engineering')),
  ('QA & Testing',           'qa-testing',            (select id from public.categories where slug = 'product-engineering')),
  ('Architecture Decisions', 'architecture-decisions', (select id from public.categories where slug = 'product-engineering'))
on conflict (slug) do nothing;

-- ───────────────────── Team Communication (6+ subcategories) ────────────
insert into public.subcategories (name, slug, category_id) values
  ('All-Hands Meeting',      'all-hands-meeting',     (select id from public.categories where slug = 'team-communication')),
  ('Standup Reactions',       'standup-reactions',      (select id from public.categories where slug = 'team-communication')),
  ('Deadline Approaching',   'deadline-approaching',  (select id from public.categories where slug = 'team-communication')),
  ('Out of Office',          'out-of-office',         (select id from public.categories where slug = 'team-communication')),
  ('Celebrations & Wins',    'celebrations-wins',     (select id from public.categories where slug = 'team-communication')),
  ('Feedback & Kudos',       'feedback-kudos',        (select id from public.categories where slug = 'team-communication')),
  ('Remote Work Life',       'remote-work-life',      (select id from public.categories where slug = 'team-communication'))
on conflict (slug) do nothing;
