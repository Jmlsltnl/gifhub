import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TrendingUp } from 'lucide-react'
import { TrendingGrid } from './trending-grid'

export const metadata: Metadata = {
  title: 'Trending GIFs — Most Popular Professional GIFs | GifHub',
  description: 'Discover the most popular and trending GIFs on GifHub. See what\'s hot in workplace communication right now.',
}

export default function TrendingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <section className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/5 dark:from-orange-500/15 dark:via-transparent dark:to-rose-500/10" />
          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                <TrendingUp size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Trending GIFs</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  The most popular GIFs on GifHub right now
                </p>
              </div>
            </div>
          </div>
        </section>

        <TrendingGrid />
      </main>
      <Footer />
    </>
  )
}
