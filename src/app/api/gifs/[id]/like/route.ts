import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function hashIp(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'ip_' + Math.abs(hash).toString(36)
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1'
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const ipHash = hashIp(getClientIp(request))

  const { data } = await supabaseAdmin
    .from('gif_likes')
    .select('id')
    .eq('gif_id', id)
    .eq('ip_hash', ipHash)
    .maybeSingle()

  return NextResponse.json({ liked: !!data })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const ipHash = hashIp(getClientIp(request))

  const { data: existing } = await supabaseAdmin
    .from('gif_likes')
    .select('id')
    .eq('gif_id', id)
    .eq('ip_hash', ipHash)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin.from('gif_likes').delete().eq('id', existing.id)

    const { count } = await supabaseAdmin
      .from('gif_likes')
      .select('*', { count: 'exact', head: true })
      .eq('gif_id', id)

    await supabaseAdmin
      .from('gifs')
      .update({ likes: count ?? 0 })
      .eq('id', id)

    return NextResponse.json({ liked: false, likes: count ?? 0 })
  }

  await supabaseAdmin
    .from('gif_likes')
    .insert({ gif_id: id, ip_hash: ipHash })

  const { count } = await supabaseAdmin
    .from('gif_likes')
    .select('*', { count: 'exact', head: true })
    .eq('gif_id', id)

  await supabaseAdmin
    .from('gifs')
    .update({ likes: count ?? 1 })
    .eq('id', id)

  return NextResponse.json({ liked: true, likes: count ?? 1 })
}
