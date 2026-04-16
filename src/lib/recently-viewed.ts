const STORAGE_KEY = 'gifhub_recently_viewed'
const MAX_ITEMS = 20

interface RecentItem {
  id: string
  slug: string
  title: string
  url: string
  viewedAt: number
}

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentlyViewed(item: Omit<RecentItem, 'viewedAt'>): void {
  if (typeof window === 'undefined') return
  const items = getRecentlyViewed().filter((i) => i.id !== item.id)
  items.unshift({ ...item, viewedAt: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}
