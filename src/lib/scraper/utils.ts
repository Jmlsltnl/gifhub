export function randomDelay(minMs = 1500, maxMs = 4000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

export function isMediaUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    lower.includes('.mp4') ||
    lower.includes('.webp') ||
    lower.includes('.gif') ||
    lower.includes('.webm')
  )
}

export function preferredFormat(urls: string[]): string | null {
  const mp4 = urls.find((u) => u.includes('.mp4'))
  if (mp4) return mp4

  const webp = urls.find((u) => u.includes('.webp'))
  if (webp) return webp

  const gif = urls.find((u) => u.includes('.gif') && !u.includes('.gifv'))
  if (gif) return gif

  return urls[0] ?? null
}
