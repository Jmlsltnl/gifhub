'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isFavorite, toggleFavorite } from '@/lib/favorites'
import { useToast } from '@/components/ui/toast'

export function FavoriteButton({ gifId }: { gifId: string }) {
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setSaved(isFavorite(gifId))
  }, [gifId])

  const handleToggle = useCallback(() => {
    const newState = toggleFavorite(gifId)
    setSaved(newState)
    toast(newState ? 'Saved to favorites' : 'Removed from favorites', 'success')
  }, [gifId, toast])

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all active:scale-95',
        saved
          ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 hover:bg-yellow-500/10 dark:text-yellow-400'
          : 'border-border bg-card text-foreground hover:bg-muted'
      )}
    >
      <Bookmark size={14} className={cn(saved && 'fill-current')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
