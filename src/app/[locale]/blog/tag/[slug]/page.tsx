import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BlogCard } from '@/components/blog-card'
import { BlogSidebar } from '@/components/blog-sidebar'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getBlogPosts, getBlogTag, getBlogCategories, getBlogTags } from '@/lib/blog-data'
import { Link } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight, Hash, ArrowLeft, BookOpen } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifhub.app'

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getBlogTag(slug)
  if (!tag) return { title: 'Tag Not Found' }

  return {
    title: `Posts Tagged "${tag.name}" — GifHub Blog`,
    description: `Browse all GifHub Blog articles tagged with "${tag.name}". Tips, guides, and insights.`,
    openGraph: {
      title: `Posts Tagged "${tag.name}" — GifHub Blog`,
      description: `Articles tagged with "${tag.name}" on GifHub Blog.`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${tag.slug}`,
    },
  }
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const tag = await getBlogTag(slug)
  if (!tag) notFound()

  const [{ posts, total, totalPages }, categories, tags] = await Promise.all([
    getBlogPosts({ page, limit: 9, tagSlug: slug }),
    getBlogCategories(),
    getBlogTags(),
  ])

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/blog' },
            { label: `#${tag.name}` },
          ]}
        />

        <div className="mt-6 mb-10">
          <Link href="/blog" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft size={14} />
            All posts
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm">
              <Hash size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">#{tag.name}</h1>
              <p className="text-muted-foreground">
                {total} article{total !== 1 ? 's' : ''} tagged with &ldquo;{tag.name}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="min-w-0 flex-1">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <BookOpen size={40} className="mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-semibold text-muted-foreground">No articles with this tag yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
                    {page > 1 && (
                      <Link
                        href={`/blog/tag/${slug}?page=${page - 1}`}
                        className="flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ChevronLeft size={14} /> Previous
                      </Link>
                    )}
                    <span className="px-4 py-2.5 text-sm font-medium text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/blog/tag/${slug}?page=${page + 1}`}
                        className="flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Next <ChevronRight size={14} />
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <div className="lg:sticky lg:top-20">
              <BlogSidebar categories={categories} tags={tags} activeTag={slug} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
