'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, Download, Check, Share2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import { useToast } from '@/components/ui/toast'

interface GifActionsProps {
  gifId: string
  url: string
  gifSrc: string
  title: string
}

export function GifActions({ gifId, url, gifSrc, title }: GifActionsProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/gifs/${gifId}/like`)
      .then((r) => r.json())
      .then((data) => setLiked(data.liked))
      .catch(() => {})
  }, [gifId])

  const handleLike = useCallback(async () => {
    if (likeLoading) return
    setLikeLoading(true)
    try {
      const res = await fetch(`/api/gifs/${gifId}/like`, { method: 'POST' })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.likes)
      toast(data.liked ? 'Added to your likes' : 'Removed from likes', 'success')
    } catch {
      toast('Failed to update like', 'error')
    }
    setLikeLoading(false)
  }, [gifId, likeLoading, toast])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      toast('Link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast('Failed to copy link', 'error')
    }
  }, [url, toast])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const res = await fetch(gifSrc)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const ext = gifSrc.includes('.mp4') ? 'mp4' : gifSrc.includes('.webp') ? 'webp' : 'gif'
      a.download = `gifhub-${Date.now()}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      toast('Download started', 'success')
    } catch {
      window.open(gifSrc, '_blank')
    } finally {
      setDownloading(false)
    }
  }, [gifSrc, toast])

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${title} — GifHub`, text: 'Check out this GIF on GifHub.App', url })
        return
      } catch { /* user cancelled */ }
    }
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      toast('Link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url, title, toast])

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton
        onClick={handleLike}
        disabled={likeLoading}
        variant={liked ? 'liked' : 'default'}
      >
        <Heart size={14} className={cn(liked && 'fill-current')} />
        {liked ? 'Liked' : 'Like'}
        {likeCount > 0 && <span className="opacity-60">({likeCount})</span>}
      </ActionButton>

      <ActionButton onClick={handleCopy}>
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </ActionButton>

      <ActionButton onClick={handleDownload} disabled={downloading} variant="primary">
        <Download size={14} className={downloading ? 'animate-bounce' : ''} />
        {downloading ? 'Saving...' : 'Download'}
      </ActionButton>

      <ActionButton onClick={handleShare}>
        <Share2 size={14} />
        Share
      </ActionButton>
    </div>
  )
}

function ActionButton({ children, onClick, disabled, variant = 'default' }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'liked'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'liked' && 'border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10',
        variant === 'default' && 'border border-border bg-card text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}
