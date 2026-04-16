import type { MetadataRoute } from 'next'
import { getCategories, getAllGifSlugs } from '@/lib/data'
import { getAllBlogSlugs, getBlogCategories, getBlogTags } from '@/lib/blog-data'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifhub.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  })

  entries.push({
    url: `${BASE_URL}/explore`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  })

  const staticPages = [
    { path: '/about', priority: 0.7 },
    { path: '/trending', priority: 0.8 },
    { path: '/guides', priority: 0.7 },
    { path: '/developers', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
  ]

  for (const sp of staticPages) {
    entries.push({
      url: `${BASE_URL}${sp.path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: sp.priority,
    })
  }

  const categories = await getCategories()
  for (const cat of categories) {
    entries.push({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })

    for (const sub of cat.subcategories) {
      entries.push({
        url: `${BASE_URL}/category/${cat.slug}/${sub.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  const slugs = await getAllGifSlugs()
  for (const slug of slugs) {
    entries.push({
      url: `${BASE_URL}/gif/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  // Blog
  entries.push({
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  })

  try {
    const blogSlugs = await getAllBlogSlugs()
    for (const bs of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/blog/${bs}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    const blogCategories = await getBlogCategories()
    for (const bc of blogCategories) {
      entries.push({
        url: `${BASE_URL}/blog/category/${bc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    const blogTags = await getBlogTags()
    for (const bt of blogTags) {
      entries.push({
        url: `${BASE_URL}/blog/tag/${bt.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  } catch { /* blog tables may not exist yet */ }

  // CMS Pages
  try {
    const supabase = await createClient()
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('is_published', true)

    for (const page of pages ?? []) {
      entries.push({
        url: `${BASE_URL}/${page.slug}`,
        lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  } catch { /* pages table may not exist yet */ }

  return entries
}
