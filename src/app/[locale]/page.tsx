import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { GifGrid } from '@/components/gif-grid'
import { LoadMoreGrid } from '@/components/load-more-grid'
import { CategoryShowcase } from '@/components/category-showcase'
import { RecentlyViewedSection } from '@/components/recently-viewed-section'
import { StatsBar } from '@/components/stats-bar'
import { GifGridSkeleton } from '@/components/gif-skeleton'
import { getCategories, getFeaturedGifs, getLatestGifs, getTrendingGifs, getGifCount, getCategoryGifCounts } from '@/lib/data'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <Suspense>
          <HeroSection />
        </Suspense>
        <div className="mt-10">
          <RecentlyViewedSection />
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSection />
        </Suspense>
        <div className="mt-12">
          <Suspense fallback={<SectionSkeleton />}>
            <CategorySection />
          </Suspense>
        </div>
        <div className="mt-12">
          <Suspense>
            <PlatformStats />
          </Suspense>
        </div>
        <div className="mt-12">
          <Suspense fallback={<SectionSkeleton />}>
            <FeaturedSection />
          </Suspense>
        </div>
        <div className="mt-12">
          <Suspense fallback={<SectionSkeleton />}>
            <LatestSection />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}

function SectionSkeleton() {
  return (
    <div>
      <div className="mb-5 h-7 w-40 animate-pulse rounded-lg bg-muted" />
      <GifGridSkeleton count={4} />
    </div>
  )
}

async function HeroSection() {
  const [totalGifs, categories] = await Promise.all([
    getGifCount(),
    getCategories(),
  ])
  return <Hero totalGifs={totalGifs} totalCategories={categories.length} />
}

async function TrendingSection() {
  const trending = await getTrendingGifs(8)
  if (!trending.length) return null
  return <GifGrid title="Trending Now" gifs={trending} columns={4} viewAllHref="/explore" />
}

async function CategorySection() {
  const [categories, gifCounts] = await Promise.all([
    getCategories(),
    getCategoryGifCounts(),
  ])
  return <CategoryShowcase categories={categories} gifCounts={gifCounts} />
}

async function PlatformStats() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const [
    { count: gifCount },
    { count: catCount },
    { data: viewsData },
    { data: likesData },
  ] = await Promise.all([
    supabase.from('gifs').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('gifs').select('views'),
    supabase.from('gifs').select('likes'),
  ])

  const totalViews = (viewsData ?? []).reduce((sum: number, g: { views: number }) => sum + g.views, 0)
  const totalLikes = (likesData ?? []).reduce((sum: number, g: { likes: number }) => sum + g.likes, 0)

  return (
    <StatsBar
      totalGifs={gifCount ?? 0}
      totalCategories={catCount ?? 0}
      totalViews={totalViews}
      totalLikes={totalLikes}
    />
  )
}

async function FeaturedSection() {
  const featured = await getFeaturedGifs(8)
  if (!featured.length) return null
  return <GifGrid title="Most Viewed" gifs={featured} columns={4} viewAllHref="/explore" />
}

async function LatestSection() {
  const [latest, totalCount] = await Promise.all([
    getLatestGifs(16),
    getGifCount(),
  ])
  return (
    <LoadMoreGrid
      title="Latest GIFs"
      initialGifs={latest}
      sort="latest"
      initialHasMore={totalCount > 16}
    />
  )
}
