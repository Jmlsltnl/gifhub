'use client'

import { useState, useCallback } from 'react'
import { Link2, Check } from 'lucide-react'

interface BlogCopyLinkProps {
  slug: string
}

export function BlogCopyLink({ slug }: BlogCopyLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gifhub.app'
    const url = `${baseUrl}/blog/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }, [slug])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      title="Copy link to this article"
    >
      {copied ? (
        <><Check size={12} className="text-green-500" /> Copied!</>
      ) : (
        <><Link2 size={12} /> Copy Link</>
      )}
    </button>
  )
}
