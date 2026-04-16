import { searchGiphy } from './giphy'
import { searchTenor } from './tenor'
import type { ScrapedGif, ScrapeResult } from './types'

export type { ScrapedGif, ScrapeResult } from './types'

export interface ScrapeOptions {
  queries: string[]
  maxPerQuery?: number
  platforms?: ('giphy' | 'tenor')[]
}

export interface BatchScrapeResult {
  gifs: ScrapedGif[]
  totalScraped: number
  deduplicatedCount: number
  errors: string[]
}

export async function scrapeGifs(options: ScrapeOptions): Promise<BatchScrapeResult> {
  const {
    queries,
    maxPerQuery = 8,
    platforms = ['giphy', 'tenor'],
  } = options

  const allGifs: ScrapedGif[] = []
  const allErrors: string[] = []
  const seenUrls = new Set<string>()
  let totalScraped = 0

  const hasGiphy = platforms.includes('giphy') && !!process.env.GIPHY_API_KEY
  const hasTenor = platforms.includes('tenor') && !!process.env.TENOR_API_KEY

  if (!hasGiphy && !hasTenor) {
    allErrors.push('No API keys configured. Set GIPHY_API_KEY and/or TENOR_API_KEY in .env.local')
    return { gifs: [], totalScraped: 0, deduplicatedCount: 0, errors: allErrors }
  }

  for (const query of queries) {
    const fetches: Promise<ScrapeResult>[] = []

    if (hasGiphy) fetches.push(searchGiphy(query, maxPerQuery))
    if (hasTenor) fetches.push(searchTenor(query, maxPerQuery))

    const results = await Promise.allSettled(fetches)

    for (const settled of results) {
      if (settled.status === 'rejected') {
        allErrors.push(`Query "${query}" failed: ${settled.reason}`)
        continue
      }

      const result = settled.value
      allErrors.push(...result.errors)

      for (const gif of result.gifs) {
        totalScraped++
        if (!gif.mediaUrl) continue

        const normalized = normalizeMediaUrl(gif.mediaUrl)
        if (seenUrls.has(normalized)) continue
        seenUrls.add(normalized)

        allGifs.push(gif)
      }
    }
  }

  return {
    gifs: allGifs,
    totalScraped,
    deduplicatedCount: totalScraped - allGifs.length,
    errors: allErrors,
  }
}

function normalizeMediaUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString().toLowerCase()
  } catch {
    return url.toLowerCase().split('?')[0]
  }
}
