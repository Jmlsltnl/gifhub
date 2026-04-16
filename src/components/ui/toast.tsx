'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const noopToast: ToastContextValue = { toast: () => {} }

export function useToast() {
  const ctx = React.useContext(ToastContext)
  return ctx ?? noopToast
}

const ICONS = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 sm:bottom-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'flex max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-lg',
                t.type === 'success' && 'border-green-500/20 bg-green-500/10 text-green-700 dark:border-green-400/20 dark:bg-green-500/15 dark:text-green-300',
                t.type === 'error' && 'border-red-500/20 bg-red-500/10 text-red-700 dark:border-red-400/20 dark:bg-red-500/15 dark:text-red-300',
                t.type === 'info' && 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-300',
              )}
            >
              <span className="shrink-0">{ICONS[t.type]}</span>
              <span className="flex-1 font-medium">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
