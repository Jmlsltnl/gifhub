'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { Tag } from 'lucide-react'

interface TagData {
  name: string
  count: number
}

export function TagCloud() {
  const [tags, setTags] = useState<TagData[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/tags/popular')
      .then((r) => r.json())
      .then((data) => setTags(data.tags ?? []))
      .catch(() => {})
  }, [])

  if (tags.length === 0) return null

  const maxCount = Math.max(...tags.map((t) => t.count), 1)
  const visibleTags = isExpanded ? tags : tags.slice(0, 20)

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 dark:bg-card/30">
      <div className="mb-4 flex items-center gap-2">
        <Tag size={14} className="text-primary" />
        <h3 className="text-sm font-semibold">Popular Tags</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag, i) => {
          const ratio = tag.count / maxCount
          const size = ratio > 0.7 ? 'text-sm' : ratio > 0.4 ? 'text-xs' : 'text-[11px]'
          const opacity = ratio > 0.5 ? 'opacity-100' : ratio > 0.2 ? 'opacity-80' : 'opacity-60'

          return (
            <motion.button
              key={tag.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              onClick={() => router.push(`/search?q=${encodeURIComponent(tag.name)}`)}
              className={`${size} ${opacity} rounded-lg border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-95`}
            >
              #{tag.name}
              <span className="ml-1 text-[9px] opacity-50">{tag.count}</span>
            </motion.button>
          )
        })}
      </div>

      {tags.length > 20 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          {isExpanded ? 'Show less' : `Show all ${tags.length} tags`}
        </button>
      )}
    </div>
  )
}
