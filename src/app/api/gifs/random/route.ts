import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from('gifs').select('id', { count: 'exact', head: true })
    if (!count || count === 0) {
      return NextResponse.json({ slug: null })
    }

    const randomOffset = Math.floor(Math.random() * count)
    const { data } = await supabase
      .from('gifs')
      .select('slug')
      .range(randomOffset, randomOffset)
      .limit(1)

    const slug = data?.[0]?.slug ?? null
    return NextResponse.json({ slug })
  } catch {
    return NextResponse.json({ slug: null })
  }
}
