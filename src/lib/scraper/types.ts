export interface ScrapedGif {
  sourceUrl: string
  mediaUrl: string
  previewUrl: string
  altText: string
  sourceTitle: string
  width: number
  height: number
  sourcePlatform: 'giphy' | 'tenor'
  searchQuery: string
}

export interface ScrapeResult {
  query: string
  gifs: ScrapedGif[]
  errors: string[]
}
