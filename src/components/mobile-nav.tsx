'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Home, Compass, Bookmark, FolderOpen, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/collections', label: 'Boards', icon: FolderOpen },
  { href: '/favorites', label: 'Saved', icon: Bookmark },
]

export function MobileNav() {
  const pathname = usePathname()
  const cleanPath = pathname.replace(/^\/en/, '') || '/'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg sm:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = cleanPath === item.href || (item.href !== '/' && cleanPath.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
