import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const { data } = await supabaseAdmin
    .from('categories')
    .select('*, subcategories(*)')
    .order('name')

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const body = await request.json()
  const { name, slug, description } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name, slug, description: description ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
