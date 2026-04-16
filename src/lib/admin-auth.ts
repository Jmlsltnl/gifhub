import { NextRequest, NextResponse } from 'next/server'

export function adminAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
