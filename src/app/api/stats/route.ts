import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const [
      { count: gifCount },
      { count: catCount },
      { data: viewsData },
      { data: likesData },
    ] = await Promise.all([
      supabase.from('gifs').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('gifs').select('views'),
      supabase.from('gifs').select('likes'),
    ])

    const totalViews = (viewsData ?? []).reduce((sum: number, g: { views: number }) => sum + g.views, 0)
    const totalLikes = (likesData ?? []).reduce((sum: number, g: { likes: number }) => sum + g.likes, 0)

    return NextResponse.json({
      totalGifs: gifCount ?? 0,
      totalCategories: catCount ?? 0,
      totalViews,
      totalLikes,
    })
  } catch {
    return NextResponse.json({ totalGifs: 0, totalCategories: 0, totalViews: 0, totalLikes: 0 })
  }
}
