'use client'

import { useState, useEffect } from 'react'
import { FileType, Ruler, ExternalLink, Copy, Check, Link2 } from 'lucide-react'
import { copyToClipboard } from '@/lib/clipboard'
import { useToast } from '@/components/ui/toast'

interface GifInfoPanelProps {
  gifUrl: string
  title: string
}

interface GifMeta {
  format: string
  width: number | null
  height: number | null
}

export function GifInfoPanel({ gifUrl, title }: GifInfoPanelProps) {
  const [meta, setMeta] = useState<GifMeta | null>(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const ext = gifUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? 'gif'
    const format = ext === 'mp4' ? 'MP4' : ext === 'webm' ? 'WebM' : ext === 'webp' ? 'WebP' : 'GIF'

    const img = new window.Image()
    img.onload = () => {
      setMeta({ format, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      setMeta({ format, width: null, height: null })
    }
    img.src = gifUrl
  }, [gifUrl])

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(gifUrl)
    if (ok) {
      setUrlCopied(true)
      toast('Direct GIF URL copied', 'success')
      setTimeout(() => setUrlCopied(false), 2000)
    }
  }

  if (!meta) return null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InfoChip icon={<FileType size={13} />} label="Format" value={meta.format} />
        {meta.width && meta.height && (
          <InfoChip icon={<Ruler size={13} />} label="Size" value={`${meta.width}×${meta.height}`} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2 dark:bg-muted/30">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Link2 size={10} />
            Direct URL
          </p>
          <p className="mt-0.5 truncate text-xs text-foreground">{gifUrl}</p>
        </div>
        <button
          onClick={handleCopyUrl}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          aria-label="Copy direct URL"
        >
          {urlCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>

      <a
        href={gifUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ExternalLink size={11} />
        Open original in new tab
      </a>
    </div>
  )
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 dark:bg-muted/30">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
