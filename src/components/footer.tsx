import { Link } from '@/i18n/navigation'
import { getSettings } from '@/lib/settings'
import { getCategories } from '@/lib/data'
import { Flame } from 'lucide-react'

export async function Footer() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ])

  const siteName = settings.site_name || 'GifHub'
  const year = new Date().getFullYear()
  const topCategories = categories.slice(0, 6)

  return (
    <footer className="mt-auto border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame size={14} />
              </div>
              <span className="text-lg font-bold">
                Gif<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The professional GIF platform for workplace communication. Discover, share, and download curated GIFs.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Discover</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/explore" className="text-sm text-muted-foreground transition-colors hover:text-primary">Explore</Link></li>
              <li><Link href="/trending" className="text-sm text-muted-foreground transition-colors hover:text-primary">Trending</Link></li>
              <li><Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-primary">Search</Link></li>
              <li><Link href="/favorites" className="text-sm text-muted-foreground transition-colors hover:text-primary">Favorites</Link></li>
              <li><Link href="/collections" className="text-sm text-muted-foreground transition-colors hover:text-primary">Collections</Link></li>
              {topCategories.slice(0, 3).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-primary">Blog</Link></li>
              <li><Link href="/guides" className="text-sm text-muted-foreground transition-colors hover:text-primary">Integration Guides</Link></li>
              <li><Link href="/developers" className="text-sm text-muted-foreground transition-colors hover:text-primary">Developer API</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {year} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</Link>
            <Link href="/developers" className="text-xs text-muted-foreground transition-colors hover:text-foreground">API</Link>
            <Link href="/contact" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
