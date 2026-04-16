import type { ScrapedGif, ScrapeResult } from './types'

const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search'

interface GiphyImage {
  url?: string
  mp4?: string
  width?: string
  height?: string
}

interface GiphyGif {
  id: string
  title: string
  slug: string
  url: string
  rating: string
  images: {
    original: GiphyImage
    downsized_medium: GiphyImage
    fixed_height: GiphyImage
    preview_gif: GiphyImage
  }
}

interface GiphyResponse {
  data: GiphyGif[]
  pagination: { total_count: number; count: number; offset: number }
}

export async function searchGiphy(query: string, limit = 10): Promise<ScrapeResult> {
  const result: ScrapeResult = { query, gifs: [], errors: [] }

  const apiKey = process.env.GIPHY_API_KEY
  if (!apiKey) {
    result.errors.push('GIPHY_API_KEY not configured')
    return result
  }

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      q: query,
      limit: String(limit),
      rating: 'g',
      lang: 'en',
    })

    const res = await fetch(`${GIPHY_API_URL}?${params}`, {
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      result.errors.push(`Giphy API ${res.status}: ${res.statusText}`)
      return result
    }

    const data: GiphyResponse = await res.json()

    for (const gif of data.data) {
      const mediaUrl =
        gif.images.downsized_medium?.url ||
        gif.images.original?.url ||
        ''

      const previewUrl =
        gif.images.fixed_height?.url ||
        gif.images.preview_gif?.url ||
        ''

      if (!mediaUrl) continue

      result.gifs.push({
        sourceUrl: gif.url,
        mediaUrl,
        previewUrl,
        altText: gif.title || query,
        sourceTitle: gif.title || '',
        width: parseInt(gif.images.original?.width || '480', 10),
        height: parseInt(gif.images.original?.height || '360', 10),
        sourcePlatform: 'giphy',
        searchQuery: query,
      })
    }
  } catch (err) {
    result.errors.push(`Giphy: ${err instanceof Error ? err.message : String(err)}`)
  }

  return result
}
