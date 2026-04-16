import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, ctx: Ctx) {
  const denied = adminAuth(request)
  if (denied) return denied
  const { id } = await ctx.params
  const body = await request.json()

  const { data, error } = await supabaseAdmin
    .from('blog_categories')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const denied = adminAuth(request)
  if (denied) return denied
  const { id } = await ctx.params

  const { error } = await supabaseAdmin
    .from('blog_categories')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
