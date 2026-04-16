'use client'

import { useState, useEffect, useCallback } from 'react'
import { FolderPlus, Plus, Trash2, ChevronRight, FolderOpen } from 'lucide-react'
import { GifCard } from '@/components/gif-card'
import { GifGridSkeleton } from '@/components/gif-skeleton'
import { getCollections, createCollection, deleteCollection, type Collection } from '@/lib/collections'
import type { GifItem } from '@/lib/types'

export function CollectionsView() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const cols = getCollections()
    setCollections(cols)
    if (cols.length > 0 && !activeId) setActiveId(cols[0].id)
  }, [])

  const activeCollection = collections.find((c) => c.id === activeId)

  useEffect(() => {
    if (!activeCollection || activeCollection.gifIds.length === 0) {
      setGifs([])
      return
    }
    setLoading(true)
    fetch('/api/gifs/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: activeCollection.gifIds }),
    })
      .then((r) => r.json())
      .then((data) => setGifs(data.gifs ?? []))
      .catch(() => setGifs([]))
      .finally(() => setLoading(false))
  }, [activeCollection])

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    const col = createCollection(newName)
    setCollections(getCollections())
    setActiveId(col.id)
    setNewName('')
    setCreating(false)
  }, [newName])

  const handleDelete = useCallback((id: string) => {
    deleteCollection(id)
    const updated = getCollections()
    setCollections(updated)
    if (activeId === id) {
      setActiveId(updated[0]?.id ?? null)
    }
  }, [activeId])

  if (collections.length === 0 && !creating) {
    return (
      <div className="flex flex-col items-center py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FolderOpen size={24} className="text-muted-foreground" />
        </div>
        <p className="mt-5 text-lg font-semibold">No collections yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a collection to organize your GIFs
        </p>
        <button
          onClick={() => setCreating(true)}
          className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} /> Create Collection
        </button>

        {creating && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Collection name"
              autoFocus
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleCreate}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Create
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <div>
        <div className="space-y-1">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveId(col.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                activeId === col.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FolderPlus size={14} />
                {col.name}
                <span className="text-xs text-muted-foreground">({col.gifIds.length})</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(col.id) }}
                  className="rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete collection"
                >
                  <Trash2 size={12} />
                </button>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>

        {creating ? (
          <div className="mt-3 flex gap-1.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Name"
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button onClick={handleCreate} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="mt-3 flex w-full items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus size={12} /> New Collection
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {activeCollection && (
          <h2 className="mb-5 text-xl font-bold tracking-tight">{activeCollection.name}</h2>
        )}

        {loading ? (
          <GifGridSkeleton count={4} />
        ) : gifs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gifs.map((gif, i) => (
              <GifCard key={gif.id} gif={gif} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-muted-foreground">
              {activeCollection ? 'No GIFs in this collection yet' : 'Select a collection'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the &quot;Collect&quot; button on any GIF to add it here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
