'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check, Share2, Heart, Eye, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import type { GifItem } from '@/lib/types'

interface LightboxProps {
  gif: GifItem | null
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function Lightbox({ gif, onClose, onNext, onPrev, hasNext, hasPrev }: LightboxProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!gif) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext()
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [gif, onClose, onNext, onPrev, hasNext, hasPrev])

  const handleCopy = useCallback(async () => {
    if (!gif) return
    const url = `${window.location.origin}/gif/${gif.slug}`
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [gif])

  const handleDownload = useCallback(() => {
    if (!gif) return
    const a = document.createElement('a')
    a.href = gif.url
    a.download = `${gif.slug}.gif`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [gif])

  const handleViewDetail = useCallback(() => {
    if (!gif) return
    window.location.href = `/gif/${gif.slug}`
  }, [gif])

  return (
    <AnimatePresence>
      {gif && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Navigation arrows */}
          {hasPrev && onPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev() }}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {hasNext && onNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext() }}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
              <div className="relative aspect-video w-full bg-black">
                <Image
                  src={gif.url}
                  alt={gif.altText}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-card-foreground">{gif.title}</h2>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {formatCount(gif.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} /> {formatCount(gif.likes)}
                      </span>
                      {gif.categorySlug && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium capitalize text-primary">
                          {gif.categorySlug.replace(/-/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <LbBtn onClick={handleViewDetail}>
                    <ExternalLink size={13} /> View Details
                  </LbBtn>
                  <LbBtn onClick={handleCopy}>
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </LbBtn>
                  <LbBtn onClick={handleDownload}>
                    <Download size={13} /> Download
                  </LbBtn>
                </div>

                {gif.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {gif.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LbBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-all',
        'hover:bg-muted active:scale-95'
      )}
    >
      {children}
    </button>
  )
}
