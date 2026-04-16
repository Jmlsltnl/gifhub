import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') ?? '1')
  const limit = parseInt(url.searchParams.get('limit') ?? '20')
  const search = url.searchParams.get('search') ?? ''
  const categoryId = url.searchParams.get('category_id') ?? ''

  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('gifs')
    .select('*, categories(name, slug), subcategories(name, slug)', { count: 'exact' })

  if (search) {
    query = query.or(`title.ilike.%${search}%,alt_text.ilike.%${search}%`)
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({
    gifs: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  })
}
