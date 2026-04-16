'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { CategoryWithSubs } from '@/lib/types'

interface SidebarProps {
  categories: CategoryWithSubs[]
}

export function Sidebar({ categories }: SidebarProps) {
  const [openId, setOpenId] = useState<string | null>(categories[0]?.id ?? null)

  return (
    <aside className="w-60 shrink-0">
      <nav className="flex flex-col gap-0.5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Categories
        </p>
        {categories.map((cat) => {
          const isOpen = openId === cat.id
          return (
            <div key={cat.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : cat.id)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span>{cat.name}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="ml-3 overflow-hidden border-l-2 border-primary/20 pl-3"
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className="block rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                    >
                      All {cat.name}
                    </Link>
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${cat.slug}/${sub.slug}`}
                        className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
