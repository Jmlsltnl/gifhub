'use client'

import { motion } from 'framer-motion'

const GRADIENTS: Record<string, string> = {
  'saas': 'from-blue-600/20 via-cyan-500/10 to-blue-500/5',
  'fintech': 'from-emerald-600/20 via-green-500/10 to-emerald-500/5',
  'product-engineering': 'from-orange-600/20 via-amber-500/10 to-orange-500/5',
  'startup-culture': 'from-violet-600/20 via-purple-500/10 to-violet-500/5',
  'remote-work': 'from-pink-600/20 via-rose-500/10 to-pink-500/5',
  'marketing': 'from-yellow-600/20 via-amber-500/10 to-yellow-500/5',
  'customer-success': 'from-teal-600/20 via-cyan-500/10 to-teal-500/5',
}

const FALLBACK = 'from-primary/15 via-primary/5 to-transparent'

export function CategoryHero({
  name,
  slug,
  description,
  gifCount,
}: {
  name: string
  slug: string
  description?: string | null
  gifCount: number
}) {
  const gradient = GRADIENTS[slug] ?? FALLBACK

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mb-8 overflow-hidden rounded-2xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/5 blur-[80px]" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-[60px]" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        {description && (
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{gifCount.toLocaleString()}</span> GIFs
          </span>
        </div>
      </div>
    </motion.div>
  )
}
