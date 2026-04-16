import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { LoadMoreGrid } from '@/components/load-more-grid'
import { CategoryHero } from '@/components/category-hero'
import { getCategoryBySlug, getCategories, getGifsByCategory, getGifCount } from '@/lib/data'
import { Link } from '@/i18n/navigation'
import { ChevronRight } from 'lucide-react'
import type { CategoryWithSubs } from '@/lib/types'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} GIFs — Professional ${category.name} GIFs for Business | GifHub`,
    description: category.description ?? `Browse professional ${category.name} GIFs on GifHub.App — curated for workplace communication and business presentations.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [categories, gifs, totalCount] = await Promise.all([
    getCategories(),
    getGifsByCategory(category.id, 16),
    getGifCount(category.id),
  ])

  const thisCat = categories.find((c: CategoryWithSubs) => c.id === category.id)
  const subcategories = thisCat?.subcategories ?? []
  const hasMore = totalCount > 16

  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <div className="hidden lg:block">
          <Sidebar categories={categories} />
        </div>
        <main className="min-w-0 flex-1">
          <nav className="mb-5 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight size={12} />
            <span className="font-medium text-foreground">{category.name}</span>
          </nav>

          <div className="mb-4 lg:hidden">
            <MobileSidebar categories={categories} />
          </div>

          <CategoryHero
            name={category.name}
            slug={slug}
            description={category.description}
            gifCount={totalCount}
          />

          {subcategories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href={`/category/${slug}`}
                className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary"
              >
                All
              </Link>
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${slug}/${sub.slug}`}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {gifs.length > 0 ? (
            <LoadMoreGrid
              title={`${category.name} GIFs`}
              initialGifs={gifs}
              sort="latest"
              categoryId={category.id}
              initialHasMore={hasMore}
            />
          ) : (
            <div className="flex flex-col items-center py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <span className="text-3xl">📂</span>
              </div>
              <p className="text-lg font-medium">No GIFs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Content is being curated for this category.</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}
