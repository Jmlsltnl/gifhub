import { Link } from '@/i18n/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Home, Search, Compass, TrendingUp } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:py-32">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-400/20 to-primary/20 blur-[80px]" />
          <p className="relative text-[120px] font-extrabold leading-none tracking-tighter text-primary/15 sm:text-[160px]">
            404
          </p>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
        <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          Oops! The GIF you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry — there are thousands more to discover.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Home size={14} />
            Go Home
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
          >
            <Search size={14} />
            Search GIFs
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-md gap-3 sm:grid-cols-2">
          <SuggestionCard
            href="/explore"
            icon={<Compass size={18} />}
            title="Explore"
            description="Browse all GIFs with filters"
          />
          <SuggestionCard
            href="/trending"
            icon={<TrendingUp size={18} />}
            title="Trending"
            description="See what's popular now"
          />
        </div>
      </div>
      <Footer />
    </>
  )
}

function SuggestionCard({ href, icon, title, description }: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 transition-all hover:border-primary/20 hover:bg-card hover:shadow-md dark:bg-card/30"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
