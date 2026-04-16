import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: gifTags } = await supabase
    .from('gif_tags')
    .select('tag_id')

  if (!gifTags?.length) {
    return NextResponse.json({ tags: [] })
  }

  const countMap: Record<string, number> = {}
  for (const gt of gifTags) {
    countMap[gt.tag_id] = (countMap[gt.tag_id] ?? 0) + 1
  }

  const sorted = Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)

  const tagIds = sorted.map(([id]) => id)

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .in('id', tagIds)

  if (!tags?.length) {
    return NextResponse.json({ tags: [] })
  }

  const nameById: Record<string, string> = {}
  for (const t of tags) nameById[t.id] = t.name

  const result = sorted
    .map(([id, count]) => ({ name: nameById[id], count }))
    .filter((t) => t.name)

  return NextResponse.json({ tags: result })
}
