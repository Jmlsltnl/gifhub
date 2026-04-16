import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CollectionsView } from './collections-view'
import { FolderOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Collections',
  description: 'Your GIF collections on GifHub.App',
}

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-20 sm:px-6 sm:pb-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Collections</h1>
            <p className="text-sm text-muted-foreground">
              Organize your GIFs into themed boards
            </p>
          </div>
        </div>
        <CollectionsView />
      </div>
      <Footer />
    </>
  )
}
