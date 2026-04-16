import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { id } = await context.params
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.slug !== undefined) updates.slug = body.slug
  if (body.body !== undefined) updates.body = body.body
  if (body.is_published !== undefined) updates.is_published = body.is_published
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('pages')
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
  const { error } = await supabaseAdmin.from('pages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
