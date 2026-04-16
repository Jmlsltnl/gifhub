'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Zap, Globe, Shuffle } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { addSearchTerm } from '@/lib/search-history'

export function Hero({ totalGifs = 0, totalCategories = 0 }: { totalGifs?: number; totalCategories?: number }) {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [randomLoading, setRandomLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/tags/popular')
      .then((r) => r.json())
      .then((data) => setTags((data.tags ?? []).slice(0, 8).map((t: { name: string }) => t.name)))
      .catch(() => {})
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      addSearchTerm(trimmed)
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }, [query, router])

  const handleRandom = useCallback(async () => {
    setRandomLoading(true)
    try {
      const res = await fetch('/api/gifs/random')
      const data = await res.json()
      if (data.slug) {
        router.push(`/gif/${data.slug}`)
        return
      }
    } catch { /* ignore */ }
    setRandomLoading(false)
  }, [router])

  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4 dark:from-primary/15 dark:via-primary/5 dark:to-transparent" />
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/8 blur-[100px] dark:bg-primary/20" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/15" />

      <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find the perfect
            <span className="block bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent dark:from-primary dark:via-violet-300 dark:to-purple-400">
              GIF
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            The professional GIF library for workplace communication, presentations, and social media.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search GIFs — reactions, memes, celebrations..."
                className="h-13 w-full rounded-2xl border border-border bg-card pl-11 pr-28 text-base shadow-lg placeholder:text-muted-foreground transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:bg-card/80 dark:shadow-xl dark:shadow-primary/5 sm:h-14 sm:text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 sm:px-6 sm:py-2.5"
              >
                Search
              </button>
            </div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={handleRandom}
              disabled={randomLoading}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary active:scale-95 disabled:opacity-50 dark:bg-muted/30"
            >
              <Shuffle size={12} className={randomLoading ? 'animate-spin' : ''} />
              I&apos;m Feeling Lucky
            </button>
          </motion.div>

          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-2"
            >
              <span className="text-xs text-muted-foreground">Trending:</span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    addSearchTerm(tag)
                    router.push(`/search?q=${encodeURIComponent(tag)}`)
                  }}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary dark:bg-muted/30"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {totalGifs > 0 && (
              <Stat icon={<Zap size={14} />} value={totalGifs.toLocaleString()} label="GIFs" />
            )}
            {totalCategories > 0 && (
              <Stat icon={<TrendingUp size={14} />} value={String(totalCategories)} label="Categories" />
            )}
            <Stat icon={<Globe size={14} />} value="Free" label="to use" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  )
}
