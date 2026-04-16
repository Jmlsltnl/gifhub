'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['/', 'Ctrl+K'], description: 'Focus search bar' },
  { keys: ['Esc'], description: 'Close dialog / unfocus input' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['G', 'H'], description: 'Go to Home' },
  { keys: ['G', 'E'], description: 'Go to Explore' },
  { keys: ['G', 'F'], description: 'Go to Favorites' },
  { keys: ['G', 'C'], description: 'Go to Collections' },
  { keys: ['T'], description: 'Toggle theme (dark/light)' },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const [pendingG, setPendingG] = useState(false)

  useEffect(() => {
    let gTimeout: ReturnType<typeof setTimeout> | null = null

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.key === 'Escape') {
        if (open) { setOpen(false); return }
        ;(document.activeElement as HTMLElement)?.blur()
        return
      }

      if (isInput) return

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('header input[type="text"]')?.focus()
        return
      }

      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }

      if (e.key === 't' || e.key === 'T') {
        document.querySelector<HTMLButtonElement>('[aria-label="Toggle theme"]')?.click()
        return
      }

      if (e.key === 'g' || e.key === 'G') {
        setPendingG(true)
        if (gTimeout) clearTimeout(gTimeout)
        gTimeout = setTimeout(() => setPendingG(false), 800)
        return
      }

      if (pendingG) {
        setPendingG(false)
        if (gTimeout) clearTimeout(gTimeout)
        const routes: Record<string, string> = { h: '/', e: '/explore', f: '/favorites', c: '/collections' }
        const route = routes[e.key.toLowerCase()]
        if (route) {
          window.location.href = `/en${route}`
        }
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (gTimeout) clearTimeout(gTimeout)
    }
  }, [open, pendingG])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="divide-y divide-border/50 px-5 py-2">
              {SHORTCUTS.map((s) => (
                <div key={s.description} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">{s.description}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((key) => (
                      <kbd
                        key={key}
                        className="flex min-w-[24px] items-center justify-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-medium text-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-3">
              <p className="text-center text-xs text-muted-foreground">
                Press <kbd className="mx-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">?</kbd> to toggle this dialog
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
