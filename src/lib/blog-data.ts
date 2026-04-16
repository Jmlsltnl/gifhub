import { supabaseAdmin } from '@/lib/supabase/admin'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  post_count?: number
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  post_count?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  featured_image: string | null
  status: 'draft' | 'published' | 'scheduled'
  author: string
  reading_time: number
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  canonical_url: string | null
  published_at: string | null
  is_featured: boolean
  views: number
  created_at: string
  updated_at: string
  categories: BlogCategory[]
  tags: BlogTag[]
}

function extractRelations(raw: any): BlogPost {
  const categories = (raw.blog_post_categories ?? [])
    .map((r: any) => r.blog_categories)
    .filter(Boolean)

  const tags = (raw.blog_post_tags ?? [])
    .map((r: any) => r.blog_tags)
    .filter(Boolean)

  const { blog_post_categories, blog_post_tags, ...rest } = raw
  return { ...rest, categories, tags }
}

export async function getBlogPosts(opts?: {
  page?: number
  limit?: number
  categorySlug?: string
  tagSlug?: string
}): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> {
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 10
  const offset = (page - 1) * limit

  let postIds: string[] | null = null

  if (opts?.categorySlug) {
    const { data } = await supabaseAdmin
      .from('blog_post_categories')
      .select('post_id, blog_categories!inner(slug)')
      .eq('blog_categories.slug', opts.categorySlug)
    postIds = data?.map((r) => r.post_id) ?? []
  }

  if (opts?.tagSlug) {
    const { data } = await supabaseAdmin
      .from('blog_post_tags')
      .select('post_id, blog_tags!inner(slug)')
      .eq('blog_tags.slug', opts.tagSlug)
    const tagPostIds = data?.map((r) => r.post_id) ?? []
    postIds = postIds ? postIds.filter((id) => tagPostIds.includes(id)) : tagPostIds
  }

  let query = supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))', { count: 'exact' })
    .eq('status', 'published')

  if (postIds !== null) {
    if (postIds.length === 0) return { posts: [], total: 0, totalPages: 0 }
    query = query.in('id', postIds)
  }

  const { data, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const total = count ?? 0
  return {
    posts: (data ?? []).map(extractRelations),
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return null

  await supabaseAdmin
    .from('blog_posts')
    .update({ views: (data.views ?? 0) + 1 })
    .eq('id', data.id)

  return extractRelations(data)
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data: categories } = await supabaseAdmin
    .from('blog_categories')
    .select('*')
    .order('sort_order')

  if (!categories?.length) return []

  const { data: counts } = await supabaseAdmin
    .from('blog_post_categories')
    .select('category_id')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
  }

  return categories.map((c) => ({ ...c, post_count: countMap[c.id] ?? 0 }))
}

export async function getBlogCategory(slug: string): Promise<BlogCategory | null> {
  const { data } = await supabaseAdmin
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const { data: tags } = await supabaseAdmin
    .from('blog_tags')
    .select('*')
    .order('name')

  if (!tags?.length) return []

  const { data: counts } = await supabaseAdmin
    .from('blog_post_tags')
    .select('tag_id')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.tag_id] = (countMap[row.tag_id] ?? 0) + 1
  }

  return tags.map((t) => ({ ...t, post_count: countMap[t.id] ?? 0 }))
}

export async function getBlogTag(slug: string): Promise<BlogTag | null> {
  const { data } = await supabaseAdmin
    .from('blog_tags')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map(extractRelations)
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  return (data ?? []).map((p) => p.slug)
}

export function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi,
    (_match, level, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (attrs.includes('id=')) return _match
      return `<h${level}${attrs} id="${id}"><a href="#${id}" class="anchor-link">${content}</a></h${level}>`
    }
  )
}

export async function getRelatedPosts(currentSlug: string, categoryIds: string[], limit = 3): Promise<BlogPost[]> {
  if (!categoryIds.length) return []

  const { data: relatedPostIds } = await supabaseAdmin
    .from('blog_post_categories')
    .select('post_id')
    .in('category_id', categoryIds)

  const ids = [...new Set((relatedPostIds ?? []).map((r) => r.post_id))]

  if (!ids.length) return []

  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('*, blog_post_categories(blog_categories(id, name, slug)), blog_post_tags(blog_tags(id, name, slug))')
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .in('id', ids)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map(extractRelations)
}
