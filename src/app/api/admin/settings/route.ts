import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/admin-auth'
import { getSettings, updateSettings } from '@/lib/settings'

export async function GET(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: NextRequest) {
  const denied = adminAuth(request)
  if (denied) return denied

  const body = await request.json()
  await updateSettings(body)
  const updated = await getSettings()
  return NextResponse.json(updated)
}
