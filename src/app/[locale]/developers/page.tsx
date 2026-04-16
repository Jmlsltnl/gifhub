import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Code2, Zap, Search, TrendingUp, Shuffle, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Developer API — GifHub',
  description: 'Explore GifHub\'s public API endpoints for searching, browsing, and integrating GIFs into your applications.',
}

const BASE = 'https://gifhub.app'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/gifs',
    description: 'Fetch paginated GIFs with sorting and filtering',
    icon: <Search size={16} />,
    params: [
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', description: 'Results per page (default: 16, max: 50)' },
      { name: 'sort', type: 'string', description: '"latest" | "trending" | "popular"' },
      { name: 'category_id', type: 'string', description: 'Filter by category UUID' },
      { name: 'q', type: 'string', description: 'Search query string' },
    ],
    example: `${BASE}/api/gifs?sort=trending&limit=8`,
  },
  {
    method: 'GET',
    path: '/api/gifs/random',
    description: 'Get a random GIF slug for discovery features',
    icon: <Shuffle size={16} />,
    params: [],
    example: `${BASE}/api/gifs/random`,
  },
  {
    method: 'GET',
    path: '/api/tags/popular',
    description: 'Get popular tags with usage counts',
    icon: <TrendingUp size={16} />,
    params: [],
    example: `${BASE}/api/tags/popular`,
  },
  {
    method: 'GET',
    path: '/api/stats',
    description: 'Get platform-wide statistics',
    icon: <Eye size={16} />,
    params: [],
    example: `${BASE}/api/stats`,
  },
]

export default function DevelopersPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Code2 size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Developer API</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Integrate GifHub GIFs into your applications, bots, and tools
            using our public REST API endpoints.
          </p>
        </section>

        {/* Quick Start */}
        <section className="mb-10 rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <h2 className="text-lg font-bold">Quick Start</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            No API key required for read-only endpoints. All responses are JSON.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background p-4">
            <code className="text-sm text-foreground">
              <span className="text-green-500">fetch</span>(<span className="text-primary">&apos;{BASE}/api/gifs?sort=trending&amp;limit=4&apos;</span>)
              <br />
              {'  '}.then(r =&gt; r.json())
              <br />
              {'  '}.then(data =&gt; console.log(data.gifs))
            </code>
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Endpoints</h2>
          <div className="space-y-6">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {ep.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-600 dark:text-green-400">
                        {ep.method}
                      </span>
                      <code className="text-sm font-semibold text-foreground">{ep.path}</code>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{ep.description}</p>
                  </div>
                </div>

                {ep.params.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {ep.params.map((p) => (
                            <tr key={p.name}>
                              <td className="px-3 py-2">
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{p.name}</code>
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{p.type}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example</p>
                  <div className="overflow-x-auto rounded-xl border border-border bg-background px-3 py-2">
                    <code className="text-xs text-primary break-all">{ep.example}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Response Format */}
        <section className="mt-10 rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
          <h2 className="text-lg font-bold">Response Format</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">/api/gifs</code> endpoint returns:
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-4">
            <pre className="text-xs text-foreground">
{`{
  "gifs": [
    {
      "id": "uuid",
      "title": "GIF title",
      "slug": "gif-slug",
      "url": "https://...gif",
      "altText": "Description",
      "views": 142,
      "likes": 8,
      "categorySlug": "saas",
      "subcategorySlug": "product-launch",
      "tags": ["celebration", "launch"]
    }
  ],
  "hasMore": true
}`}
            </pre>
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 dark:bg-yellow-500/10">
          <h2 className="text-lg font-bold">Rate Limiting</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Public endpoints are rate-limited to ensure fair usage. Please keep requests
            under <strong className="text-foreground">60 requests per minute</strong> per IP.
            For higher limits or commercial use, please{' '}
            <a href="/contact" className="text-primary hover:underline">contact us</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
