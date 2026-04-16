import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const url = new URL(request.url)
  const categoryId = url.searchParams.get('category_id')

  let query = supabaseAdmin.from('subcategories').select('*, categories(name)')
  if (categoryId) query = query.eq('category_id', categoryId)

  const { data } = await query.order('name')
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const body = await request.json()
  const { name, slug, category_id } = body

  if (!name || !slug || !category_id) {
    return NextResponse.json({ error: 'Name, slug, and category_id are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('subcategories')
    .insert({ name, slug, category_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
