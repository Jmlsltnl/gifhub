'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { GifCard } from '@/components/gif-card'
import { GifGridSkeleton } from '@/components/gif-skeleton'
import { getFavorites } from '@/lib/favorites'
import type { GifItem } from '@/lib/types'

export function FavoritesGrid() {
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getFavorites()
    if (ids.length === 0) {
      setLoading(false)
      return
    }

    fetch('/api/gifs/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => setGifs(data.gifs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <GifGridSkeleton count={6} />

  if (gifs.length === 0) {
    return (
      <div className="flex flex-col items-center py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Bookmark size={24} className="text-muted-foreground" />
        </div>
        <p className="mt-5 text-lg font-semibold">No favorites yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Click the Save button on any GIF to add it here
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {gifs.map((gif, i) => (
        <GifCard key={gif.id} gif={gif} index={i} />
      ))}
    </div>
  )
}
