import { Link } from '@/i18n/navigation'
import { FolderOpen, Tag, TrendingUp, Sparkles, Compass, BarChart3 } from 'lucide-react'
import type { BlogCategory, BlogTag } from '@/lib/blog-data'

interface BlogSidebarProps {
  categories: BlogCategory[]
  tags: BlogTag[]
  activeCategory?: string
  activeTag?: string
}

export function BlogSidebar({ categories, tags, activeCategory, activeTag }: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <FolderOpen size={15} className="text-primary" />
          Categories
        </h3>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/blog"
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                !activeCategory && !activeTag ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All Posts
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/blog/category/${cat.slug}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeCategory === cat.slug ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{cat.name}</span>
                {(cat.post_count ?? 0) > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">{cat.post_count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Tags */}
      {tags.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Tag size={15} className="text-primary" />
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.filter((t) => (t.post_count ?? 0) > 0).slice(0, 15).map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  activeTag === tag.slug
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links to Platform */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <Sparkles size={15} className="text-primary" />
          Explore GifHub
        </h3>
        <ul className="space-y-0.5">
          {[
            { href: '/explore', label: 'Browse All GIFs', icon: <Compass size={14} /> },
            { href: '/trending', label: 'Trending GIFs', icon: <TrendingUp size={14} /> },
            { href: '/category/marketing', label: 'Marketing GIFs', icon: <BarChart3 size={14} /> },
            { href: '/category/saas', label: 'SaaS GIFs', icon: <FolderOpen size={14} /> },
            { href: '/guides', label: 'Integration Guides', icon: <Tag size={14} /> },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="text-primary/60">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
