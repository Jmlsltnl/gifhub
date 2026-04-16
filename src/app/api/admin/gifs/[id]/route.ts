import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { id } = await context.params
  const body = await request.json()

  const allowedFields = ['title', 'alt_text', 'category_id', 'subcategory_id']
  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('gifs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { id } = await context.params

  const { data: gif } = await supabaseAdmin
    .from('gifs')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (gif?.storage_path) {
    await supabaseAdmin.storage.from('gifs-bucket').remove([gif.storage_path])
  }

  await supabaseAdmin.from('gif_tags').delete().eq('gif_id', id)
  const { error } = await supabaseAdmin.from('gifs').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
