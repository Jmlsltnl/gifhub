'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderPlus, Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import {
  getCollections,
  createCollection,
  addToCollection,
  removeFromCollection,
  isInCollection,
  type Collection,
} from '@/lib/collections'

export function AddToCollection({ gifId }: { gifId: string }) {
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCollections(getCollections())
  }, [open])

  const handleToggle = useCallback((colId: string) => {
    const col = collections.find((c) => c.id === colId)
    if (isInCollection(colId, gifId)) {
      removeFromCollection(colId, gifId)
      toast(`Removed from "${col?.name}"`, 'info')
    } else {
      addToCollection(colId, gifId)
      toast(`Added to "${col?.name}"`, 'success')
    }
    setCollections(getCollections())
  }, [gifId, collections, toast])

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    const col = createCollection(newName)
    addToCollection(col.id, gifId)
    setNewName('')
    setCreating(false)
    setCollections(getCollections())
    toast(`Created "${col.name}" and added GIF`, 'success')
  }, [newName, gifId, toast])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
      >
        <FolderPlus size={14} />
        Collect
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Collections</span>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-48 space-y-1 overflow-y-auto">
                {collections.length === 0 && !creating && (
                  <p className="py-3 text-center text-xs text-muted-foreground">No collections yet</p>
                )}
                {collections.map((col) => {
                  const isIn = col.gifIds.includes(gifId)
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggle(col.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        isIn ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <span className="truncate">{col.name}</span>
                      {isIn && <Check size={14} />}
                    </button>
                  )
                })}
              </div>

              {creating ? (
                <div className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="Collection name"
                    autoFocus
                    className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleCreate}
                    className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <Plus size={12} /> New Collection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
