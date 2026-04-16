import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { data } = await supabaseAdmin
    .from('pages')
    .select('*')
    .order('title')

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const body = await request.json()
  const { title, slug, body: htmlBody, is_published } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('pages')
    .insert({
      title,
      slug,
      body: htmlBody ?? '',
      is_published: is_published ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
