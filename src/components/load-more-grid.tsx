'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { GifCard } from './gif-card'
import { Lightbox } from './lightbox'
import { GifGridSkeleton } from './gif-skeleton'
import type { GifItem } from '@/lib/types'

interface LoadMoreGridProps {
  title: string
  initialGifs: GifItem[]
  sort: 'latest' | 'trending' | 'popular'
  categoryId?: string
  initialHasMore: boolean
}

function dedupeGifs(gifs: GifItem[]): GifItem[] {
  const seen = new Set<string>()
  return gifs.filter((g) => {
    if (seen.has(g.id)) return false
    seen.add(g.id)
    return true
  })
}

export function LoadMoreGrid({ title, initialGifs, sort, categoryId, initialHasMore }: LoadMoreGridProps) {
  const [gifs, setGifs] = useState<GifItem[]>(() => dedupeGifs(initialGifs))
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [lightboxGif, setLightboxGif] = useState<GifItem | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const lightboxIndex = lightboxGif ? gifs.findIndex((g) => g.id === lightboxGif.id) : -1

  const handleNext = useCallback(() => {
    if (lightboxIndex < gifs.length - 1) setLightboxGif(gifs[lightboxIndex + 1])
  }, [lightboxIndex, gifs])

  const handlePrev = useCallback(() => {
    if (lightboxIndex > 0) setLightboxGif(gifs[lightboxIndex - 1])
  }, [lightboxIndex, gifs])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const nextPage = page + 1
    const params = new URLSearchParams({ page: String(nextPage), limit: '12', sort })
    if (categoryId) params.set('category_id', categoryId)

    try {
      const res = await fetch(`/api/gifs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGifs((prev) => {
          const existingIds = new Set(prev.map((g) => g.id))
          const newGifs = (data.gifs as GifItem[]).filter((g) => !existingIds.has(g.id))
          return [...prev, ...newGifs]
        })
        setHasMore(data.hasMore)
        setPage(nextPage)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [loading, hasMore, page, sort, categoryId])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (gifs.length === 0) return null

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gifs.map((gif, i) => (
          <GifCard key={gif.id} gif={gif} index={i} onQuickView={setLightboxGif} />
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {hasMore && !loading && <div ref={sentinelRef} className="h-1" />}

      {!hasMore && gifs.length > 12 && (
        <p className="mt-10 text-center text-xs text-muted-foreground">You&apos;ve seen all GIFs</p>
      )}

      <Lightbox
        gif={lightboxGif}
        onClose={() => setLightboxGif(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={lightboxIndex < gifs.length - 1}
        hasPrev={lightboxIndex > 0}
      />
    </section>
  )
}
