'use client'

import { useEffect, useRef } from 'react'

export function ViewTracker({ gifId }: { gifId: string }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch(`/api/gifs/${gifId}/view`, { method: 'POST' }).catch(() => {})
  }, [gifId])

  return null
}
