import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('blog_posts')
    .update({ views: (data.views ?? 0) + 1 })
    .eq('id', data.id)

  return NextResponse.json(data)
}
