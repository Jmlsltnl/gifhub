'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const labels: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe',
}

export function LanguageSelector() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next })
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Globe size={14} />
        <span>{labels[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border bg-card p-1 shadow-lg">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                l === locale ? 'font-medium text-primary' : 'text-foreground'
              }`}
            >
              {labels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
