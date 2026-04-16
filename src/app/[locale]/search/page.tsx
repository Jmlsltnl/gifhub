import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GifGrid } from '@/components/gif-grid'
import { searchGifs, getCategories } from '@/lib/data'
import { Link } from '@/i18n/navigation'
import { SearchIcon, SearchX, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Search: ${q}` : 'Search GIFs' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const [gifs, categories] = await Promise.all([
    query ? searchGifs(query) : Promise.resolve([]),
    getCategories(),
  ])

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-foreground">Search</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {query ? `"${query}"` : 'Search GIFs'}
          </h1>
          {query && (
            <p className="mt-1 text-sm text-muted-foreground">
              {gifs.length} result{gifs.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {!query && (
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Browse by category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {gifs.length > 0 ? (
          <GifGrid title="Results" gifs={gifs} columns={4} />
        ) : query ? (
          <div className="flex flex-col items-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <SearchX size={24} className="text-muted-foreground" />
            </div>
            <p className="mt-5 text-lg font-semibold">No results for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try different keywords or browse categories
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <SearchIcon size={24} className="text-muted-foreground" />
            </div>
            <p className="mt-5 text-lg font-semibold">Search for GIFs</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a keyword to find the perfect GIF
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
