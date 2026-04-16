import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(category_id, blog_categories(id, name, slug)), blog_post_tags(tag_id, blog_tags(id, name, slug))', { count: 'exact' })

  if (search) query = query.ilike('title', `%${search}%`)
  if (status) query = query.eq('status', status)
  if (categoryId) {
    const { data: postIds } = await supabaseAdmin
      .from('blog_post_categories')
      .select('post_id')
      .eq('category_id', categoryId)
    if (postIds?.length) {
      query = query.in('id', postIds.map((r) => r.post_id))
    } else {
      return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 })
    }
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
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

export async function POST(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const body = await request.json()
  const {
    title, slug, excerpt, body: postBody, featured_image,
    status: postStatus, author, reading_time,
    meta_title, meta_description, og_image, canonical_url,
    published_at, scheduled_at, is_featured,
    category_ids, tag_ids,
  } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  const insertData: any = {
    title, slug,
    excerpt: excerpt ?? null,
    body: postBody ?? '',
    featured_image: featured_image ?? null,
    status: postStatus ?? 'draft',
    author: author ?? 'GifHub Team',
    reading_time: reading_time ?? 1,
    is_featured: is_featured ?? false,
    meta_title: meta_title ?? null,
    meta_description: meta_description ?? null,
    og_image: og_image ?? null,
    canonical_url: canonical_url ?? null,
  }

  if (postStatus === 'published' && !published_at) {
    insertData.published_at = new Date().toISOString()
  } else if (published_at) {
    insertData.published_at = published_at
  }
  if (scheduled_at) insertData.scheduled_at = scheduled_at

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(insertData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (category_ids?.length) {
    await supabaseAdmin.from('blog_post_categories').insert(
      category_ids.map((cid: string) => ({ post_id: post.id, category_id: cid }))
    )
  }

  if (tag_ids?.length) {
    await supabaseAdmin.from('blog_post_tags').insert(
      tag_ids.map((tid: string) => ({ post_id: post.id, tag_id: tid }))
    )
  }

  return NextResponse.json(post, { status: 201 })
}
