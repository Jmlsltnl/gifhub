import { getSettings } from '@/lib/settings'

export async function GET() {
  const settings = await getSettings()
  const content = settings.ads_txt_content?.trim()

  if (!content) {
    return new Response('# ads.txt — Configure in Admin > Settings > Monetization\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(content + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
