'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './sidebar'
import type { CategoryWithSubs } from '@/lib/types'

interface MobileSidebarProps {
  categories: CategoryWithSubs[]
}

export function MobileSidebar({ categories }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Browse categories"
      >
        <Menu size={15} />
        <span>Categories</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-background p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-bold">
                  Gif<span className="text-primary">Hub</span>
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <div onClick={() => setIsOpen(false)}>
                <Sidebar categories={categories} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
