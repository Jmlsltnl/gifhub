const STORAGE_KEY = 'gifhub_favorites'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(gifId: string): boolean {
  return getFavorites().includes(gifId)
}

export function toggleFavorite(gifId: string): boolean {
  const favorites = getFavorites()
  const idx = favorites.indexOf(gifId)
  if (idx >= 0) {
    favorites.splice(idx, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return false
  }
  favorites.unshift(gifId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.slice(0, 200)))
  return true
}

export function getFavoriteCount(): number {
  return getFavorites().length
}
