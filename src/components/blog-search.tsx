'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Loader2, X, FileText } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'

export function BlogSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/posts?limit=5&search=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.posts ?? [])
      }
    } catch { /* */ }
    setLoading(false)
  }, [])

  const handleChange = useCallback((val: string) => {
    setQuery(val)
    setIsOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }, [search])

  const handleSelect = useCallback((slug: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/blog/${slug}`)
  }, [router])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search articles..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:border-primary"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
              No articles found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul>
              {results.map((post: any) => (
                <li key={post.id}>
                  <button
                    onClick={() => handleSelect(post.slug)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                      {post.excerpt && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.excerpt}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
