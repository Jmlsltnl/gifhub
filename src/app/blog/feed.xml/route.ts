import { getBlogPosts } from '@/lib/blog-data'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifhub.app'

export async function GET() {
  const { posts } = await getBlogPosts({ limit: 50 })

  const items = posts.map((post) => {
    const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString()
    const categories = post.categories.map((c) => `<category>${escapeXml(c.name)}</category>`).join('\n      ')

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt ?? '')}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(post.author)}</dc:creator>
      ${categories}
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GifHub Blog — GIF Tips for Business</title>
    <link>${BASE_URL}/blog</link>
    <description>Expert articles on using GIFs for business communication, marketing, and workplace culture.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/icon-512.png</url>
      <title>GifHub Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
