'use client'

import { useEffect, useState, useRef } from 'react'
import { Image as ImageIcon, FolderOpen, Eye, Heart } from 'lucide-react'

interface StatsBarProps {
  totalGifs: number
  totalCategories: number
  totalViews: number
  totalLikes: number
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || target === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{formatNumber(count)}</span>
}

export function StatsBar({ totalGifs, totalCategories, totalViews, totalLikes }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={<ImageIcon size={18} />} target={totalGifs} label="GIFs" />
      <StatCard icon={<FolderOpen size={18} />} target={totalCategories} label="Categories" />
      <StatCard icon={<Eye size={18} />} target={totalViews} label="Views" />
      <StatCard icon={<Heart size={18} />} target={totalLikes} label="Likes" />
    </div>
  )
}

function StatCard({ icon, target, label }: { icon: React.ReactNode; target: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 dark:bg-card/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight">
          <AnimatedNumber target={target} />
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
