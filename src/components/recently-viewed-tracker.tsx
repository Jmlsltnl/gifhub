'use client'

import { useEffect, useRef } from 'react'
import { addRecentlyViewed } from '@/lib/recently-viewed'

interface Props {
  gifId: string
  slug: string
  title: string
  url: string
}

export function RecentlyViewedTracker({ gifId, slug, title, url }: Props) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    addRecentlyViewed({ id: gifId, slug, title, url })
  }, [gifId, slug, title, url])

  return null
}
