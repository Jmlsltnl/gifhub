import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BlogCard } from '@/components/blog-card'
import { BlogInternalLinks } from '@/components/blog-internal-links'
import { BlogNewsletter } from '@/components/blog-newsletter'
import { BlogToc } from '@/components/blog-toc'
import { BlogReadingProgress } from '@/components/blog-reading-progress'
import { BlogCopyLink } from '@/components/blog-copy-link'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getBlogPost, getRelatedPosts, getAllBlogSlugs, getBlogCategories, getBlogTags, injectHeadingIds } from '@/lib/blog-data'
import { BlogSidebar } from '@/components/blog-sidebar'
import { Link } from '@/i18n/navigation'
import { Clock, Eye, Calendar, User, ArrowLeft, Tag, Share2, Rss } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifhub.app'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Post Not Found' }

  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || ''
  const ogImage = post.og_image || post.featured_image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author],
      tags: post.tags.map((t) => t.name),
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: post.canonical_url || `${BASE_URL}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const processedBody = injectHeadingIds(post.body)
  const categoryIds = post.categories.map((c) => c.id)
  const [relatedPosts, categories, tags] = await Promise.all([
    getRelatedPosts(slug, categoryIds),
    getBlogCategories(),
    getBlogTags(),
  ])

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null

  const wordCount = post.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GifHub',
      url: 'https://gifhub.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gifhub.app/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    image: post.featured_image || post.og_image || undefined,
    wordCount,
    keywords: post.tags.map((t) => t.name).join(', '),
    articleSection: post.categories.map((c) => c.name).join(', '),
  }

  const shareUrl = `${BASE_URL}/blog/${post.slug}`
  const shareTitle = encodeURIComponent(post.title)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <BlogReadingProgress />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/blog' },
            ...(post.categories[0] ? [{ label: post.categories[0].name, href: `/blog/category/${post.categories[0].slug}` }] : []),
            { label: post.title },
          ]}
        />

        <div className="mt-8 flex flex-col gap-12 lg:flex-row">
          {/* Article */}
          <article className="min-w-0 flex-1">
            <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft size={14} />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              {post.categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog/category/${cat.slug}`}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/20"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <User size={15} />
                  {post.author}
                </span>
                {publishDate && (
                  <time dateTime={post.published_at!} className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {publishDate}
                  </time>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.reading_time} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {post.views.toLocaleString()} views
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <figure className="mb-10 overflow-hidden rounded-2xl border border-border shadow-sm">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="aspect-[2/1] w-full object-cover"
                  loading="eager"
                />
              </figure>
            )}

            {/* Table of Contents */}
            <BlogToc html={processedBody} />

            {/* Body */}
            <div
              className="prose prose-lg mt-10 max-w-none dark:prose-invert
                prose-headings:text-foreground prose-headings:font-bold prose-headings:scroll-mt-24
                prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-3
                prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
                prose-p:text-muted-foreground prose-p:leading-[1.8]
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                prose-strong:text-foreground prose-strong:font-semibold
                prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:marker:text-primary/40
                prose-ul:my-4 prose-ol:my-4
                prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-muted-foreground
                prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
                prose-pre:rounded-xl prose-pre:border prose-pre:border-border
                prose-img:rounded-xl prose-img:shadow-sm prose-img:border prose-img:border-border
                prose-hr:border-border
                [&_.anchor-link]:no-underline [&_.anchor-link]:text-inherit hover:[&_.anchor-link]:text-primary"
              dangerouslySetInnerHTML={{ __html: processedBody }}
            />

            {/* Newsletter CTA */}
            <BlogNewsletter />

            {/* Internal links to GifHub features */}
            <BlogInternalLinks />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 border-t border-border pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog/tag/${tag.slug}`}
                      className="rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Share2 size={15} />
                  Share this article
                </span>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1DA1F2]/10 px-3.5 py-2 text-xs font-medium text-[#1DA1F2] transition-colors hover:bg-[#1DA1F2]/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A66C2]/10 px-3.5 py-2 text-xs font-medium text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1877F2]/10 px-3.5 py-2 text-xs font-medium text-[#1877F2] transition-colors hover:bg-[#1877F2]/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                  </a>
                  <a
                    href={`mailto:?subject=${shareTitle}&body=${encodeURIComponent(`Check this out: ${shareUrl}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    Email
                  </a>
                  <BlogCopyLink slug={post.slug} />
                </div>
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author}</p>
                <p className="text-sm text-muted-foreground">
                  Content writer at GifHub. Covering business communication, GIF culture, and workplace trends.
                </p>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-14">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Related Articles</h2>
                  <Link href="/blog" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <BlogCard key={rp.id} post={rp} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="space-y-6 lg:sticky lg:top-20">
              <BlogSidebar categories={categories} tags={tags} />

              {/* RSS */}
              <div className="rounded-xl border border-border bg-card p-4">
                <a
                  href="/blog/feed.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Rss size={15} className="text-orange-500" />
                  Subscribe via RSS Feed
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
