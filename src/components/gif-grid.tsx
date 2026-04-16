'use client'

import { useState, useCallback } from 'react'
import { GifCard } from './gif-card'
import { Lightbox } from './lightbox'
import type { GifItem } from '@/lib/types'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'

interface GifGridProps {
  title: string
  gifs: GifItem[]
  viewAllHref?: string
  columns?: 3 | 4
}

export function GifGrid({ title, gifs, viewAllHref, columns = 3 }: GifGridProps) {
  const [lightboxGif, setLightboxGif] = useState<GifItem | null>(null)

  const lightboxIndex = lightboxGif ? gifs.findIndex((g) => g.id === lightboxGif.id) : -1

  const handleNext = useCallback(() => {
    if (lightboxIndex < gifs.length - 1) setLightboxGif(gifs[lightboxIndex + 1])
  }, [lightboxIndex, gifs])

  const handlePrev = useCallback(() => {
    if (lightboxIndex > 0) setLightboxGif(gifs[lightboxIndex - 1])
  }, [lightboxIndex, gifs])

  if (gifs.length === 0) return null

  const gridCols = columns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className={`grid gap-4 ${gridCols}`}>
        {gifs.map((gif, i) => (
          <GifCard key={gif.id} gif={gif} index={i} onQuickView={setLightboxGif} />
        ))}
      </div>

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
