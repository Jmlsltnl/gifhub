import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  const { data } = await supabaseAdmin
    .from('gifs')
    .select('views')
    .eq('id', id)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('gifs')
    .update({ views: (data.views ?? 0) + 1 })
    .eq('id', id)

  return NextResponse.json({ views: (data.views ?? 0) + 1 })
}
