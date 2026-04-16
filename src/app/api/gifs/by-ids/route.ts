import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { ids } = await request.json()

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ gifs: [] })
  }

  const uniqueIds = [...new Set(ids as string[])].slice(0, 50)
  const supabase = await createClient()

  const { data: gifs } = await supabase
    .from('gifs')
    .select('*, category:categories(slug), subcategory:subcategories(slug)')
    .in('id', uniqueIds)

  if (!gifs?.length) {
    return NextResponse.json({ gifs: [] })
  }

  const gifIds = gifs.map((g: any) => g.id)
  const { data: gifTags } = await supabase
    .from('gif_tags')
    .select('gif_id, tag_id')
    .in('gif_id', gifIds)

  let tagMap: Record<string, string[]> = {}

  if (gifTags?.length) {
    const tagIds = [...new Set(gifTags.map((gt: any) => gt.tag_id))]
    const { data: tags } = await supabase.from('tags').select('*').in('id', tagIds)
    const tagNameById: Record<string, string> = {}
    for (const t of tags ?? []) tagNameById[t.id] = t.name

    for (const gt of gifTags) {
      if (!tagMap[gt.gif_id]) tagMap[gt.gif_id] = []
      const name = tagNameById[gt.tag_id]
      if (name) tagMap[gt.gif_id].push(name)
    }
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

  const items = gifs.map((g: any) => {
    let gifUrl = g.source_url ?? ''
    if (g.storage_path && SUPABASE_URL) {
      gifUrl = `${SUPABASE_URL}/storage/v1/object/public/gifs-bucket/${g.storage_path}`
    }
    return {
      id: g.id,
      title: g.title,
      slug: g.slug,
      url: gifUrl,
      altText: g.alt_text ?? g.title,
      views: g.views,
      likes: g.likes,
      categorySlug: g.category?.slug ?? '',
      subcategorySlug: g.subcategory?.slug ?? '',
      tags: tagMap[g.id] ?? [],
    }
  })

  const orderedItems = uniqueIds.map((id) => items.find((i: any) => i.id === id)).filter(Boolean)

  return NextResponse.json({ gifs: orderedItems })
}
