import type { ScrapedGif, ScrapeResult } from './types'

const TENOR_API_URL = 'https://tenor.googleapis.com/v2/search'

interface TenorMediaFormat {
  url: string
  dims: [number, number]
  duration: number
  size: number
}

interface TenorGif {
  id: string
  title: string
  content_description: string
  itemurl: string
  url: string
  media_formats: Record<string, TenorMediaFormat>
}

interface TenorResponse {
  results: TenorGif[]
  next: string
}

export async function searchTenor(query: string, limit = 10): Promise<ScrapeResult> {
  const result: ScrapeResult = { query, gifs: [], errors: [] }

  const apiKey = process.env.TENOR_API_KEY
  if (!apiKey) {
    result.errors.push('TENOR_API_KEY not configured')
    return result
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: query,
      limit: String(limit),
      contentfilter: 'high',
      media_filter: 'gif,mediumgif,tinygif',
      client_key: 'gifhub_app',
    })

    const res = await fetch(`${TENOR_API_URL}?${params}`, {
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      result.errors.push(`Tenor API ${res.status}: ${res.statusText}`)
      return result
    }

    const data: TenorResponse = await res.json()

    for (const gif of data.results) {
      const gifFormat = gif.media_formats?.gif
      const mediumGif = gif.media_formats?.mediumgif
      const tinyGif = gif.media_formats?.tinygif

      const mediaUrl = mediumGif?.url || gifFormat?.url || ''
      const previewUrl = tinyGif?.url || gifFormat?.url || ''
      const dims = mediumGif?.dims || gifFormat?.dims || [480, 360]

      if (!mediaUrl) continue

      result.gifs.push({
        sourceUrl: gif.itemurl || gif.url,
        mediaUrl,
        previewUrl,
        altText: gif.content_description || gif.title || query,
        sourceTitle: gif.title || gif.content_description || '',
        width: dims[0],
        height: dims[1],
        sourcePlatform: 'tenor',
        searchQuery: query,
      })
    }
  } catch (err) {
    result.errors.push(`Tenor: ${err instanceof Error ? err.message : String(err)}`)
  }

  return result
}
