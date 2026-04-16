'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import type { CategoryWithSubs } from '@/lib/types'
import { ArrowRight, Image as ImageIcon } from 'lucide-react'

const COLORS = [
  { gradient: 'from-violet-500/10 to-violet-500/0 dark:from-violet-500/15 dark:to-violet-500/5', icon: 'text-violet-500', ring: 'group-hover:ring-violet-500/20' },
  { gradient: 'from-blue-500/10 to-blue-500/0 dark:from-blue-500/15 dark:to-blue-500/5', icon: 'text-blue-500', ring: 'group-hover:ring-blue-500/20' },
  { gradient: 'from-emerald-500/10 to-emerald-500/0 dark:from-emerald-500/15 dark:to-emerald-500/5', icon: 'text-emerald-500', ring: 'group-hover:ring-emerald-500/20' },
  { gradient: 'from-orange-500/10 to-orange-500/0 dark:from-orange-500/15 dark:to-orange-500/5', icon: 'text-orange-500', ring: 'group-hover:ring-orange-500/20' },
  { gradient: 'from-pink-500/10 to-pink-500/0 dark:from-pink-500/15 dark:to-pink-500/5', icon: 'text-pink-500', ring: 'group-hover:ring-pink-500/20' },
  { gradient: 'from-cyan-500/10 to-cyan-500/0 dark:from-cyan-500/15 dark:to-cyan-500/5', icon: 'text-cyan-500', ring: 'group-hover:ring-cyan-500/20' },
  { gradient: 'from-amber-500/10 to-amber-500/0 dark:from-amber-500/15 dark:to-amber-500/5', icon: 'text-amber-500', ring: 'group-hover:ring-amber-500/20' },
]

interface Props {
  categories: CategoryWithSubs[]
  gifCounts: Record<string, number>
}

export function CategoryShowcase({ categories, gifCounts }: Props) {
  if (!categories.length) return null

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((cat, i) => {
          const color = COLORS[i % COLORS.length]
          const count = gifCounts[cat.id] ?? 0
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className={`group flex flex-col gap-3 rounded-2xl bg-gradient-to-br p-4 ring-1 ring-border transition-all duration-300 hover:ring-2 hover:shadow-lg dark:hover:glow-sm ${color.gradient} ${color.ring}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-background/80 dark:bg-background/40 ${color.icon}`}>
                    <ImageIcon size={16} />
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {count} {count === 1 ? 'GIF' : 'GIFs'}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
