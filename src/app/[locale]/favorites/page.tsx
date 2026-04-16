import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FavoritesGrid } from './favorites-grid'
import { Bookmark } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Favorites',
  description: 'Your saved favorite GIFs on GifHub.App',
}

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bookmark size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Favorites</h1>
            <p className="text-sm text-muted-foreground">
              Your saved GIFs are stored locally in your browser
            </p>
          </div>
        </div>
        <FavoritesGrid />
      </div>
      <Footer />
    </>
  )
}
