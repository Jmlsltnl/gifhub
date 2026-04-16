import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit') ?? 10)))
  const category = searchParams.get('category') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const search = searchParams.get('search') ?? ''
  const featured = searchParams.get('featured') ?? ''
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, author, reading_time, published_at, views, is_featured, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))', { count: 'exact' })
    .eq('status', 'published')

  if (search) query = query.ilike('title', `%${search}%`)
  if (featured === 'true') query = query.eq('is_featured', true)

  if (category) {
    const { data: postIds } = await supabaseAdmin
      .from('blog_post_categories')
      .select('post_id, blog_categories!inner(slug)')
      .eq('blog_categories.slug', category)
    if (postIds?.length) {
      query = query.in('id', postIds.map((r) => r.post_id))
    } else {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 })
    }
  }

  if (tag) {
    const { data: postIds } = await supabaseAdmin
      .from('blog_post_tags')
      .select('post_id, blog_tags!inner(slug)')
      .eq('blog_tags.slug', tag)
    if (postIds?.length) {
      query = query.in('id', postIds.map((r) => r.post_id))
    } else {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 })
    }
  }

  const { data, count, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = count ?? 0
  return NextResponse.json({
    posts: data ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
