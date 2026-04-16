'use client'

import { Search, X, Moon, Sun, Bookmark, Flame, Compass, FolderOpen, Clock, Trash2 } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { getSearchHistory, addSearchTerm, clearSearchHistory } from '@/lib/search-history'

export function Header() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ name: string; count: number }>>([])
  const [history, setHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetch('/api/tags/popular')
      .then((r) => r.json())
      .then((data) => setSuggestions(data.tags ?? []))
      .catch(() => {})
    setHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      addSearchTerm(trimmed)
      setHistory(getSearchHistory())
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      setMobileOpen(false)
      setShowSuggestions(false)
    }
  }, [query, router])

  const handleSuggestionClick = useCallback((tag: string) => {
    setQuery(tag)
    addSearchTerm(tag)
    setHistory(getSearchHistory())
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(tag)}`)
  }, [router])

  const handleClearHistory = useCallback(() => {
    clearSearchHistory()
    setHistory([])
  }, [])

  const filteredSuggestions = query.trim()
    ? suggestions.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : suggestions.slice(0, 6)

  const showHistory = !query.trim() && history.length > 0

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'glass border-b border-border/50 shadow-sm'
          : 'bg-background/0'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Gif<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="relative mx-auto hidden max-w-lg flex-1 sm:block" ref={suggestionsRef}>
          <form onSubmit={handleSubmit} className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search thousands of GIFs..."
              className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-muted/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {showSuggestions && (showHistory || filteredSuggestions.length > 0) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl dark:shadow-2xl dark:shadow-primary/5">
              <div className="p-2">
                {showHistory && (
                  <>
                    <div className="mb-1.5 flex items-center justify-between px-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Recent searches
                      </p>
                      <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 size={10} />
                        Clear
                      </button>
                    </div>
                    {history.slice(0, 5).map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Clock size={12} className="text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                    {filteredSuggestions.length > 0 && (
                      <div className="mx-3 my-1.5 border-t border-border/50" />
                    )}
                  </>
                )}

                {filteredSuggestions.length > 0 && (
                  <>
                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {query.trim() ? 'Suggestions' : 'Trending'}
                    </p>
                    {filteredSuggestions.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => handleSuggestionClick(tag.name)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <Search size={12} className="text-muted-foreground" />
                          {tag.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{tag.count}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          <Link
            href="/explore"
            className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          >
            <Compass size={15} /> Explore
          </Link>

          <Link
            href="/blog"
            className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          >
            Blog
          </Link>

          <Link
            href="/collections"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
            aria-label="Collections"
          >
            <FolderOpen size={16} />
          </Link>

          <Link
            href="/favorites"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
            aria-label="Favorites"
          >
            <Bookmark size={16} />
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun size={16} className="hidden dark:block" />
            <Moon size={16} className="block dark:hidden" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 px-4 py-3 sm:hidden">
          <form onSubmit={handleSubmit} className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs..."
              autoFocus
              className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  )
}
