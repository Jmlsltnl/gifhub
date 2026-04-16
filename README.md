# GifHub.App

Professional GIF platform for business communication. Discover, share, and download curated GIFs for Slack, Teams, email marketing, and workplace culture.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: Google Gemini 2.5 Pro (blog generation, GIF curation) + Imagen 3 (image generation)
- **GIF Sources**: Giphy API + Tenor API
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **i18n**: next-intl (English)
- **Rich Text**: TipTap Editor

## Features

- AI-powered GIF scraping pipeline with Gemini validation
- 7 business categories with 70+ subcategories
- SEO-optimized blog system with AI generator
- Full admin CMS (GIFs, categories, blog, pages, settings)
- AdSense, Google Tag Manager, GA4, Search Console integration
- IP-based liking, native share, favorites, collections
- Dark/light mode with customizable theme colors
- PWA support, RSS feed, dynamic sitemap

## Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in the values, then run the SQL files in order:

```bash
# In Supabase SQL Editor:
# 1. supabase/schema.sql
# 2. supabase/schema-v2.sql
# 3. supabase/schema-v3-blog.sql
# 4. supabase/schema-v4-subcategories.sql
# 5. supabase/schema-v5-blog-posts.sql (optional seed data)
```

```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (or custom domain) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | Google AI API key |
| `GIPHY_API_KEY` | Giphy API key |
| `TENOR_API_KEY` | Tenor API key |
| `CRON_SECRET` | Secret for admin auth & cron endpoints |
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g. `https://gifhub.app`) |

## Deployment

Optimized for Vercel. See deployment notes in the project wiki.
