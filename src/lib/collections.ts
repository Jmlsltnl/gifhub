const STORAGE_KEY = 'gifhub_collections'

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export interface Collection {
  id: string
  name: string
  gifIds: string[]
  createdAt: number
}

function getAll(): Collection[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(collections: Collection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
}

export function getCollections(): Collection[] {
  return getAll()
}

export function createCollection(name: string): Collection {
  const collections = getAll()
  const col: Collection = {
    id: generateId(),
    name: name.trim(),
    gifIds: [],
    createdAt: Date.now(),
  }
  collections.push(col)
  saveAll(collections)
  return col
}

export function deleteCollection(id: string) {
  const collections = getAll().filter((c) => c.id !== id)
  saveAll(collections)
}

export function renameCollection(id: string, name: string) {
  const collections = getAll()
  const col = collections.find((c) => c.id === id)
  if (col) col.name = name.trim()
  saveAll(collections)
}

export function addToCollection(collectionId: string, gifId: string) {
  const collections = getAll()
  const col = collections.find((c) => c.id === collectionId)
  if (col && !col.gifIds.includes(gifId)) {
    col.gifIds.push(gifId)
    saveAll(collections)
  }
}

export function removeFromCollection(collectionId: string, gifId: string) {
  const collections = getAll()
  const col = collections.find((c) => c.id === collectionId)
  if (col) {
    col.gifIds = col.gifIds.filter((id) => id !== gifId)
    saveAll(collections)
  }
}

export function isInCollection(collectionId: string, gifId: string): boolean {
  const col = getAll().find((c) => c.id === collectionId)
  return col ? col.gifIds.includes(gifId) : false
}

export function getCollectionsForGif(gifId: string): string[] {
  return getAll()
    .filter((c) => c.gifIds.includes(gifId))
    .map((c) => c.id)
}
