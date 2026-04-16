import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TagCloud } from '@/components/tag-cloud'
import { getCategories, getGifCount } from '@/lib/data'
import { ExploreGrid } from './explore-grid'
import { Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Explore GIFs — Discover Professional GIFs by Category | GifHub',
  description: 'Browse and discover GIFs by category, trending, popular, or latest on GifHub.App — curated for workplace communication.',
}

export default async function ExplorePage() {
  const [categories, totalCount] = await Promise.all([
    getCategories(),
    getGifCount(),
  ])

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
            <p className="text-sm text-muted-foreground">
              {totalCount.toLocaleString()} GIFs across {categories.length} categories
            </p>
          </div>
        </div>

        <div className="mb-8">
          <TagCloud />
        </div>

        <ExploreGrid categories={categoryOptions} totalCount={totalCount} />
      </div>
      <Footer />
    </>
  )
}
