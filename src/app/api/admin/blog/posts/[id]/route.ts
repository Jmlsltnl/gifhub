import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, ctx: Ctx) {
  const denied = adminAuth(request)
  if (denied) return denied
  const { id } = await ctx.params

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(category_id, blog_categories(id, name, slug)), blog_post_tags(tag_id, blog_tags(id, name, slug))')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const denied = adminAuth(request)
  if (denied) return denied
  const { id } = await ctx.params
  const body = await request.json()

  const {
    title, slug, excerpt, body: postBody, featured_image,
    status: postStatus, author, reading_time,
    meta_title, meta_description, og_image, canonical_url,
    published_at, scheduled_at, is_featured,
    category_ids, tag_ids,
  } = body

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }
  if (title !== undefined) updateData.title = title
  if (slug !== undefined) updateData.slug = slug
  if (excerpt !== undefined) updateData.excerpt = excerpt
  if (postBody !== undefined) updateData.body = postBody
  if (featured_image !== undefined) updateData.featured_image = featured_image
  if (postStatus !== undefined) updateData.status = postStatus
  if (author !== undefined) updateData.author = author
  if (reading_time !== undefined) updateData.reading_time = reading_time
  if (is_featured !== undefined) updateData.is_featured = is_featured
  if (meta_title !== undefined) updateData.meta_title = meta_title
  if (meta_description !== undefined) updateData.meta_description = meta_description
  if (og_image !== undefined) updateData.og_image = og_image
  if (canonical_url !== undefined) updateData.canonical_url = canonical_url
  if (published_at !== undefined) updateData.published_at = published_at
  if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at

  if (postStatus === 'published' && !published_at) {
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('published_at')
      .eq('id', id)
      .single()
    if (!existing?.published_at) {
      updateData.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (category_ids !== undefined) {
    await supabaseAdmin.from('blog_post_categories').delete().eq('post_id', id)
    if (category_ids.length) {
      await supabaseAdmin.from('blog_post_categories').insert(
        category_ids.map((cid: string) => ({ post_id: id, category_id: cid }))
      )
    }
  }

  if (tag_ids !== undefined) {
    await supabaseAdmin.from('blog_post_tags').delete().eq('post_id', id)
    if (tag_ids.length) {
      await supabaseAdmin.from('blog_post_tags').insert(
        tag_ids.map((tid: string) => ({ post_id: id, tag_id: tid }))
      )
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const denied = adminAuth(request)
  if (denied) return denied
  const { id } = await ctx.params

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
