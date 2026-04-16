import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    { count: categoriesCount },
    { count: subcategoriesCount },
    { count: gifsCount },
    { count: tagsCount },
    { data: recentGifs },
    { data: topGifs },
    { data: categoryStats },
    { data: likesData },
  ] = await Promise.all([
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subcategories').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('gifs').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('tags').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('gifs')
      .select('title, slug, views, likes, created_at, categories(name), subcategories(name)')
      .order('created_at', { ascending: false })
      .limit(15),
    supabaseAdmin
      .from('gifs')
      .select('title, slug, views, likes')
      .order('views', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('gifs')
      .select('category_id, categories(name)'),
    supabaseAdmin
      .from('gifs')
      .select('views, likes'),
  ])

  const config = {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    giphy: !!process.env.GIPHY_API_KEY,
    tenor: !!process.env.TENOR_API_KEY,
  }

  const catCounts: Record<string, number> = {}
  for (const g of categoryStats ?? []) {
    const name = (g as any).categories?.name ?? 'Uncategorized'
    catCounts[name] = (catCounts[name] ?? 0) + 1
  }
  const categoryBreakdown = Object.entries(catCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  let totalViews = 0
  let totalLikes = 0
  for (const g of likesData ?? []) {
    totalViews += (g as any).views ?? 0
    totalLikes += (g as any).likes ?? 0
  }

  return NextResponse.json({
    categories: categoriesCount ?? 0,
    subcategories: subcategoriesCount ?? 0,
    gifs: gifsCount ?? 0,
    tags: tagsCount ?? 0,
    totalViews,
    totalLikes,
    recentGifs: (recentGifs ?? []).map((g: any) => ({
      ...g,
      categoryName: g.categories?.name ?? null,
      subcategoryName: g.subcategories?.name ?? null,
    })),
    topGifs: (topGifs ?? []).map((g: any) => ({
      title: g.title,
      slug: g.slug,
      views: g.views,
      likes: g.likes,
    })),
    categoryBreakdown,
    config,
  })
}
