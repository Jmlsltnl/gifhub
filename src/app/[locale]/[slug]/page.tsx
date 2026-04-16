import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const RESERVED_SLUGS = ['admin', 'category', 'gif', 'search', 'favorites', 'collections', 'explore', 'about', 'privacy', 'terms', 'contact', 'trending', 'guides', 'developers', 'blog']

async function getPage(slug: string) {
  try {
    const { data } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (RESERVED_SLUGS.includes(slug)) return {}
  const page = await getPage(slug)
  if (!page) return { title: 'Page Not Found' }
  return { title: page.title }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  if (RESERVED_SLUGS.includes(slug)) notFound()

  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">{page.title}</h1>
        <div
          className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
      <Footer />
    </>
  )
}
