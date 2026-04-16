'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getRecentlyViewed } from '@/lib/recently-viewed'

export function RecentlyViewedSection() {
  const [items, setItems] = useState<Array<{ id: string; slug: string; title: string; url: string }>>([])

  useEffect(() => {
    setItems(getRecentlyViewed().slice(0, 8))
  }, [])

  if (items.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Clock size={15} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground">Recently Viewed</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/gif/${item.slug}`}
            className="group flex-shrink-0"
          >
            <div className="h-16 w-28 overflow-hidden rounded-xl bg-muted transition-all group-hover:ring-2 group-hover:ring-primary/30">
              <img
                src={item.url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 w-28 truncate text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
