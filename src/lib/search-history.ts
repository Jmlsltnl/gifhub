const STORAGE_KEY = 'gifhub_search_history'
const MAX_ITEMS = 10

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addSearchTerm(term: string) {
  const trimmed = term.trim()
  if (!trimmed) return
  const history = getSearchHistory().filter((t) => t !== trimmed)
  history.unshift(trimmed)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)))
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
