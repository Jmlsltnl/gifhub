'use client'

import { useState, useEffect, useCallback } from 'react'
import { List, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface BlogTocProps {
  html: string
}

function extractHeadings(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    })
  }

  if (items.length === 0) {
    const fallback = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi
    while ((match = fallback.exec(html)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      items.push({ level: parseInt(match[1]), id, text })
    }
  }

  return items
}

export function BlogToc({ html }: BlogTocProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setHeadings(extractHeadings(html))
  }, [html])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    )

    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean)

    els.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [headings])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    }
  }, [])

  if (headings.length < 2) return null

  return (
    <nav className="rounded-xl border border-border bg-card p-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
      >
        <span className="flex items-center gap-2">
          <List size={14} className="text-primary" />
          Table of Contents
        </span>
        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!isCollapsed && (
        <ul className="mt-3 space-y-1 border-l-2 border-border pl-0">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => scrollTo(h.id)}
                className={cn(
                  'block w-full border-l-2 -ml-[2px] py-1 text-left text-sm transition-colors',
                  h.level === 3 ? 'pl-6' : 'pl-3',
                  activeId === h.id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                )}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
