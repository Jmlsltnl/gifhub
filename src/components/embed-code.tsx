'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '@/lib/clipboard'

interface EmbedCodeProps {
  gifUrl: string
  gifTitle: string
  pageUrl: string
}

export function EmbedCode({ gifUrl, gifTitle, pageUrl }: EmbedCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const htmlEmbed = `<a href="${pageUrl}" title="${gifTitle} - GifHub"><img src="${gifUrl}" alt="${gifTitle}" width="480" /></a>`
  const bbcodeEmbed = `[url=${pageUrl}][img]${gifUrl}[/img][/url]`
  const markdownEmbed = `[![${gifTitle}](${gifUrl})](${pageUrl})`
  const directLink = gifUrl

  const handleCopy = useCallback(async (text: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
      >
        Show embed codes
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Embed This GIF</h4>
        <button onClick={() => setIsOpen(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Close
        </button>
      </div>
      <div className="space-y-3">
        <EmbedRow label="HTML" code={htmlEmbed} copied={copied} onCopy={handleCopy} />
        <EmbedRow label="Markdown" code={markdownEmbed} copied={copied} onCopy={handleCopy} />
        <EmbedRow label="BBCode" code={bbcodeEmbed} copied={copied} onCopy={handleCopy} />
        <EmbedRow label="Direct Link" code={directLink} copied={copied} onCopy={handleCopy} />
      </div>
    </div>
  )
}

function EmbedRow({ label, code, copied, onCopy }: {
  label: string
  code: string
  copied: string | null
  onCopy: (text: string, label: string) => void
}) {
  const isCopied = copied === label

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          onClick={() => onCopy(code, label)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {isCopied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <code className="block overflow-x-auto rounded-lg bg-background border border-border px-3 py-2 text-xs text-muted-foreground">
        {code}
      </code>
    </div>
  )
}
