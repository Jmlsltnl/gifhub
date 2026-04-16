'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Unlock, Play, Loader2, Image as ImageIcon, Tag, FolderOpen,
  CheckCircle2, XCircle, Clock, RefreshCw, ArrowLeft,
  AlertTriangle, ExternalLink, Settings, Trash2, Pencil, Plus,
  LayoutDashboard, FileText, Palette, Rocket, Search, ChevronLeft, ChevronRight,
  Eye, Menu, X, BookOpen, Calendar, Globe, Copy, Sparkles, Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/rich-text-editor'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface ConfigStatus {
  supabase: boolean
  gemini: boolean
  giphy: boolean
  tenor: boolean
}

interface Stats {
  categories: number
  subcategories: number
  gifs: number
  tags: number
  totalViews: number
  totalLikes: number
  config: ConfigStatus
  recentGifs: Array<{
    title: string
    slug: string
    views: number
    likes: number
    created_at: string
    categoryName: string | null
    subcategoryName: string | null
  }>
  topGifs: Array<{
    title: string
    slug: string
    views: number
    likes: number
  }>
  categoryBreakdown: Array<{
    name: string
    count: number
  }>
}

interface PipelineResult {
  success: boolean
  error?: string
  stats?: {
    subcategoriesProcessed: number
    queriesGenerated: number
    scraped: number
    deduplicated: number
    validated: number
    inserted: number
    skipped: number
  }
  log: string[]
}

type PipelineStatus = 'idle' | 'running' | 'success' | 'error'
type AdminTab = 'dashboard' | 'gifs' | 'categories' | 'pages' | 'blog' | 'settings' | 'pipeline'

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'gifs', label: 'GIFs', icon: <ImageIcon size={16} /> },
  { id: 'categories', label: 'Categories', icon: <FolderOpen size={16} /> },
  { id: 'blog', label: 'Blog', icon: <BookOpen size={16} /> },
  { id: 'pages', label: 'Pages', icon: <FileText size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Palette size={16} /> },
  { id: 'pipeline', label: 'Pipeline', icon: <Rocket size={16} /> },
]

const THEME_PRESETS = [
  { name: 'Violet', primary: '#6d28d9', primaryDark: '#a78bfa', accent: '#f4f4f5', accentDark: '#27272a' },
  { name: 'Ocean', primary: '#0284c7', primaryDark: '#38bdf8', accent: '#f0f9ff', accentDark: '#1e293b' },
  { name: 'Emerald', primary: '#059669', primaryDark: '#34d399', accent: '#f0fdf4', accentDark: '#1a2e23' },
  { name: 'Rose', primary: '#e11d48', primaryDark: '#fb7185', accent: '#fff1f2', accentDark: '#2a1215' },
  { name: 'Amber', primary: '#d97706', primaryDark: '#fbbf24', accent: '#fffbeb', accentDark: '#2a2010' },
  { name: 'Slate', primary: '#475569', primaryDark: '#94a3b8', accent: '#f8fafc', accentDark: '#1e293b' },
  { name: 'Indigo', primary: '#4f46e5', primaryDark: '#818cf8', accent: '#eef2ff', accentDark: '#1e1b4b' },
  { name: 'Teal', primary: '#0d9488', primaryDark: '#2dd4bf', accent: '#f0fdfa', accentDark: '#1a2e2b' },
]

export function AdminDashboard() {
  return <AdminDashboardInner />
}

function AdminDashboardInner() {
  const [secret, setSecret] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret')
    if (saved) {
      setSecret(saved)
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${saved}` } })
        .then((r) => {
          if (r.ok) {
            setIsAuthenticated(true)
            return r.json()
          }
          sessionStorage.removeItem('admin_secret')
          return null
        })
        .then((data) => { if (data) setStats(data) })
        .catch(() => sessionStorage.removeItem('admin_secret'))
        .finally(() => setAuthLoading(false))
    } else {
      setAuthLoading(false)
    }
  }, [])

  const handleAuth = useCallback(async () => {
    setAuthError('')
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (res.ok) {
        setIsAuthenticated(true)
        sessionStorage.setItem('admin_secret', secret)
        setStats(await res.json())
      } else {
        setAuthError('Invalid secret. Check your CRON_SECRET.')
      }
    } catch {
      setAuthError('Connection failed.')
    }
  }, [secret])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_secret')
    setIsAuthenticated(false)
    setSecret('')
    setStats(null)
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) setStats(await res.json())
  }, [secret])

  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock size={20} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground">Admin Access</h1>
            <p className="text-center text-sm text-muted-foreground">Enter your CRON_SECRET to continue.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleAuth() }} className="flex flex-col gap-3">
            <Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="CRON_SECRET" autoFocus />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <Button type="submit" disabled={secret.length === 0}>
              <Unlock size={14} />
              Authenticate
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
        </a>
        <span className="text-sm font-semibold text-card-foreground">
          Gif<span className="text-primary">Hub</span> Admin
        </span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              activeTab === item.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-border p-3 space-y-1.5">
        <button
          onClick={fetchStats}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-500/10"
        >
          <Lock size={12} />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-card md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold">
            Gif<span className="text-primary">Hub</span> Admin
          </span>
        </div>

        <div className="mx-auto max-w-5xl p-4 space-y-6 sm:p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
          {activeTab === 'gifs' && <GifsTab secret={secret} />}
          {activeTab === 'categories' && <CategoriesTab secret={secret} />}
          {activeTab === 'blog' && <BlogTab secret={secret} />}
          {activeTab === 'pages' && <PagesTab secret={secret} />}
          {activeTab === 'settings' && <SettingsTab secret={secret} />}
          {activeTab === 'pipeline' && <PipelineTab secret={secret} stats={stats} fetchStats={fetchStats} />}
        </div>
      </main>
    </div>
  )
}

// ─────────────────── Dashboard Tab ───────────────────

function DashboardTab({ stats }: { stats: Stats | null }) {
  if (!stats) return <p className="text-muted-foreground">Loading...</p>

  const maxCatCount = Math.max(...(stats.categoryBreakdown?.map((c) => c.count) ?? [1]), 1)

  return (
    <>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      {stats.config && <SetupStatus config={stats.config} />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={<FolderOpen size={18} />} label="Categories" value={stats.categories} />
        <StatCard icon={<FolderOpen size={18} />} label="Subcategories" value={stats.subcategories} />
        <StatCard icon={<ImageIcon size={18} />} label="GIFs" value={stats.gifs} />
        <StatCard icon={<Tag size={18} />} label="Tags" value={stats.tags} />
        <StatCard icon={<Eye size={18} />} label="Total Views" value={stats.totalViews ?? 0} />
        <StatCard icon={<ImageIcon size={18} />} label="Total Likes" value={stats.totalLikes ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.categoryBreakdown?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GIFs by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => (
                  <div key={cat.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground">{cat.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats.topGifs?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing GIFs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topGifs.map((gif, i) => (
                  <div key={gif.slug} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{gif.title}</p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye size={10} />{gif.views}</span>
                      <span className="flex items-center gap-1">♥ {gif.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {stats.recentGifs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent GIFs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {stats.recentGifs.map((gif) => (
                <div key={gif.slug} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{gif.title}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{new Date(gif.created_at).toLocaleDateString()}</span>
                      {gif.categoryName && <Badge variant="secondary">{gif.categoryName}</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                    <span>{gif.views} views</span>
                    <span>{gif.likes} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// ─────────────────── GIFs Tab ───────────────────

function resolveGifUrl(gif: any): string {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (gif.storage_path && SUPABASE_URL) {
    return `${SUPABASE_URL}/storage/v1/object/public/gifs-bucket/${gif.storage_path}`
  }
  return gif.source_url ?? ''
}

function GifsTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [gifs, setGifs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editGif, setEditGif] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAlt, setEditAlt] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchGifs = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '15', search: q })
    const res = await fetch(`/api/admin/gifs?${params}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) {
      const data = await res.json()
      setGifs(data.gifs)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(data.page)
    }
    setLoading(false)
    setSelectedIds(new Set())
  }, [secret])

  useEffect(() => { fetchGifs() }, [fetchGifs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGifs(1, search)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this GIF permanently?')) return
    const res = await fetch(`/api/admin/gifs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    toast(res.ok ? 'GIF deleted successfully' : 'Failed to delete GIF', res.ok ? 'success' : 'error')
    fetchGifs(page, search)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} GIFs permanently?`)) return
    let deleted = 0
    for (const id of selectedIds) {
      const res = await fetch(`/api/admin/gifs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (res.ok) deleted++
    }
    toast(`Deleted ${deleted} of ${selectedIds.size} GIFs`, 'success')
    fetchGifs(page, search)
  }

  const handleEdit = (gif: any) => {
    setEditGif(gif)
    setEditTitle(gif.title)
    setEditAlt(gif.alt_text ?? '')
  }

  const handleSaveEdit = async () => {
    if (!editGif) return
    const res = await fetch(`/api/admin/gifs/${editGif.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, alt_text: editAlt }),
    })
    toast(res.ok ? 'GIF updated' : 'Failed to update', res.ok ? 'success' : 'error')
    setEditGif(null)
    fetchGifs(page, search)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === gifs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(gifs.map((g) => g.id)))
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">GIFs <span className="text-base font-normal text-muted-foreground">({total})</span></h2>
        {selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 size={14} />
            Delete {selectedIds.size} selected
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search GIFs..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" checked={gifs.length > 0 && selectedIds.size === gifs.length} onChange={toggleSelectAll} className="rounded border-border" />
                  </th>
                  <th className="w-16 px-2 py-3 text-left font-medium text-muted-foreground">Preview</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Views</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Likes</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground"><Loader2 size={16} className="inline animate-spin" /> Loading...</td></tr>
                ) : gifs.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No GIFs found.</td></tr>
                ) : gifs.map((gif) => (
                  <tr key={gif.id} className={cn('transition-colors', selectedIds.has(gif.id) ? 'bg-primary/5' : 'hover:bg-muted/30')}>
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={selectedIds.has(gif.id)} onChange={() => toggleSelect(gif.id)} className="rounded border-border" />
                    </td>
                    <td className="px-2 py-2">
                      <div className="h-10 w-14 overflow-hidden rounded-md bg-muted">
                        <img src={resolveGifUrl(gif)} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-2 font-medium">{gif.title}</td>
                    <td className="px-4 py-2">
                      <Badge variant="secondary">{gif.categories?.name ?? '—'}</Badge>
                    </td>
                    <td className="hidden px-4 py-2 text-muted-foreground sm:table-cell">{gif.views}</td>
                    <td className="hidden px-4 py-2 text-muted-foreground sm:table-cell">{gif.likes}</td>
                    <td className="hidden px-4 py-2 text-muted-foreground md:table-cell">{new Date(gif.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(gif)}><Pencil size={14} /></Button>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(gif.id)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchGifs(page - 1, search)}>
                  <ChevronLeft size={14} />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => fetchGifs(page + 1, search)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editGif} onOpenChange={() => setEditGif(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit GIF</DialogTitle></DialogHeader>
          {editGif && (
            <div className="mb-4 flex justify-center">
              <div className="h-28 w-44 overflow-hidden rounded-lg bg-muted">
                <img src={resolveGifUrl(editGif)} alt="" className="h-full w-full object-contain" />
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Alt Text / Description</Label>
              <Textarea value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGif(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─────────────────── Categories Tab ───────────────────

function CategoriesTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [showAddSub, setShowAddSub] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories', {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }, [secret])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleAddCategory = async () => {
    if (!newName || !newSlug) return
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, slug: newSlug, description: newDesc }),
    })
    toast(res.ok ? 'Category created' : 'Failed to create category', res.ok ? 'success' : 'error')
    setShowAddCat(false)
    setNewName('')
    setNewSlug('')
    setNewDesc('')
    fetchCategories()
  }

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newName || !newSlug) return
    const res = await fetch('/api/admin/subcategories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, slug: newSlug, category_id: categoryId }),
    })
    toast(res.ok ? 'Subcategory created' : 'Failed to create subcategory', res.ok ? 'success' : 'error')
    setShowAddSub(null)
    setNewName('')
    setNewSlug('')
    fetchCategories()
  }

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Delete this category and all its subcategories?')) return
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    toast(res.ok ? 'Category deleted' : 'Failed to delete', res.ok ? 'success' : 'error')
    fetchCategories()
  }

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Delete this subcategory?')) return
    const res = await fetch(`/api/admin/subcategories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    toast(res.ok ? 'Subcategory deleted' : 'Failed to delete', res.ok ? 'success' : 'error')
    fetchCategories()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => { setShowAddCat(true); setNewName(''); setNewSlug(''); setNewDesc('') }}>
          <Plus size={14} /> Add Category
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground"><Loader2 size={16} className="inline animate-spin" /> Loading...</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug} {cat.description && `— ${cat.description}`}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setShowAddSub(cat.id); setNewName(''); setNewSlug('') }}>
                      <Plus size={12} /> Sub
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteCat(cat.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {cat.subcategories?.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub: any) => (
                      <div key={sub.id} className="group flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm">
                        {sub.name}
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity"
                        >
                          <XCircle size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} className="mt-1" /></div>
            <div><Label>Slug</Label><Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCat(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showAddSub} onOpenChange={() => setShowAddSub(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Subcategory</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} className="mt-1" /></div>
            <div><Label>Slug</Label><Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSub(null)}>Cancel</Button>
            <Button onClick={() => showAddSub && handleAddSubcategory(showAddSub)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─────────────────── Pages Tab ───────────────────

function PagesTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editPage, setEditPage] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editPublished, setEditPublished] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pages', {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) setPages(await res.json())
    setLoading(false)
  }, [secret])

  useEffect(() => { fetchPages() }, [fetchPages])

  const openEdit = (p: any) => {
    setEditPage(p)
    setEditTitle(p.title)
    setEditSlug(p.slug)
    setEditBody(p.body)
    setEditPublished(p.is_published)
  }

  const openAdd = () => {
    setShowAdd(true)
    setEditTitle('')
    setEditSlug('')
    setEditBody('')
    setEditPublished(false)
  }

  const handleSave = async () => {
    let res
    if (editPage) {
      res = await fetch(`/api/admin/pages/${editPage.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, slug: editSlug, body: editBody, is_published: editPublished }),
      })
      setEditPage(null)
    } else {
      res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, slug: editSlug, body: editBody, is_published: editPublished }),
      })
      setShowAdd(false)
    }
    toast(res.ok ? 'Page saved' : 'Failed to save page', res.ok ? 'success' : 'error')
    fetchPages()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return
    const res = await fetch(`/api/admin/pages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    toast(res.ok ? 'Page deleted' : 'Failed to delete', res.ok ? 'success' : 'error')
    fetchPages()
  }

  const isEditing = !!editPage || showAdd

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pages</h2>
        <Button onClick={openAdd}><Plus size={14} /> Add Page</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground"><Loader2 size={16} className="inline animate-spin" /> Loading...</p>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.is_published ? 'default' : 'secondary'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pages.length === 0 && <p className="text-muted-foreground">No pages yet.</p>}
        </div>
      )}

      <Dialog open={isEditing} onOpenChange={() => { setEditPage(null); setShowAdd(false) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPage ? 'Edit Page' : 'Add Page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title</Label><Input value={editTitle} onChange={(e) => { setEditTitle(e.target.value); if (!editPage) setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="mt-1" /></div>
            </div>
            <div>
              <Label>Content</Label>
              <div className="mt-1">
                <RichTextEditor content={editBody} onChange={setEditBody} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editPublished} onCheckedChange={setEditPublished} />
              <Label>Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditPage(null); setShowAdd(false) }}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─────────────────── Settings Tab ───────────────────

function SettingsTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) setSettings(await res.json())
    setLoading(false)
  }, [secret])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    toast(res.ok ? 'Settings saved successfully' : 'Failed to save settings', res.ok ? 'success' : 'error')
    setSaving(false)
  }

  const update = (key: string, value: any) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  if (loading || !settings) return <p className="text-muted-foreground"><Loader2 size={16} className="inline animate-spin" /> Loading...</p>

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input value={settings.site_name ?? ''} onChange={(e) => update('site_name', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input value={settings.site_tagline ?? ''} onChange={(e) => update('site_tagline', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={settings.logo_url ?? ''} onChange={(e) => update('logo_url', e.target.value)} className="mt-1" placeholder="https://..." />
          </div>
          <div>
            <Label>Footer Text</Label>
            <Input value={settings.footer_text ?? ''} onChange={(e) => update('footer_text', e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Theme Presets</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  update('primary_color', preset.primary)
                  update('primary_color_dark', preset.primaryDark)
                  update('accent_color', preset.accent)
                  update('accent_color_dark', preset.accentDark)
                  toast(`Applied "${preset.name}" theme`, 'info')
                }}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <div className="flex gap-1">
                  <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: preset.primary }} />
                  <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: preset.primaryDark }} />
                </div>
                <span className="text-xs font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Click a preset to apply, then save to persist.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Colors</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color (Light)</Label>
              <div className="mt-1 flex gap-2">
                <input type="color" value={settings.primary_color ?? '#6d28d9'} onChange={(e) => update('primary_color', e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
                <Input value={settings.primary_color ?? ''} onChange={(e) => update('primary_color', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Primary Color (Dark)</Label>
              <div className="mt-1 flex gap-2">
                <input type="color" value={settings.primary_color_dark ?? '#a78bfa'} onChange={(e) => update('primary_color_dark', e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
                <Input value={settings.primary_color_dark ?? ''} onChange={(e) => update('primary_color_dark', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Accent Color (Light)</Label>
              <div className="mt-1 flex gap-2">
                <input type="color" value={settings.accent_color ?? '#f4f4f5'} onChange={(e) => update('accent_color', e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
                <Input value={settings.accent_color ?? ''} onChange={(e) => update('accent_color', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Accent Color (Dark)</Label>
              <div className="mt-1 flex gap-2">
                <input type="color" value={settings.accent_color_dark ?? '#27272a'} onChange={(e) => update('accent_color_dark', e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-border" />
                <Input value={settings.accent_color_dark ?? ''} onChange={(e) => update('accent_color_dark', e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default SEO Title</Label>
            <Input value={settings.seo_title ?? ''} onChange={(e) => update('seo_title', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Default SEO Description</Label>
            <Textarea value={settings.seo_description ?? ''} onChange={(e) => update('seo_description', e.target.value)} className="mt-1" rows={2} />
          </div>
          <div>
            <Label>Google Search Console Verification</Label>
            <Input value={settings.search_console_verification ?? ''} onChange={(e) => update('search_console_verification', e.target.value)} className="mt-1" placeholder="Verification code from Search Console" />
            <p className="mt-1 text-xs text-muted-foreground">The meta tag content value from Google Search Console.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Google Tag Manager ID</Label>
            <Input value={settings.gtm_id ?? ''} onChange={(e) => update('gtm_id', e.target.value)} className="mt-1" placeholder="GTM-XXXXXXX" />
            <p className="mt-1 text-xs text-muted-foreground">If GTM is set, Analytics can be managed from GTM instead.</p>
          </div>
          <Separator />
          <div>
            <Label>Google Analytics 4 Measurement ID</Label>
            <Input value={settings.ga_measurement_id ?? ''} onChange={(e) => update('ga_measurement_id', e.target.value)} className="mt-1" placeholder="G-XXXXXXXXXX" />
            <p className="mt-1 text-xs text-muted-foreground">Used only if GTM ID is not set (to avoid duplicate tracking).</p>
          </div>
          <Separator />
          <div>
            <Label>Custom Head Scripts</Label>
            <Textarea value={settings.custom_head_scripts ?? ''} onChange={(e) => update('custom_head_scripts', e.target.value)} className="mt-1 font-mono text-xs" rows={5} placeholder="<!-- Any custom HTML/JS to inject into <head> -->" />
            <p className="mt-1 text-xs text-muted-foreground">Raw HTML injected into &lt;head&gt;. Use for additional tracking pixels, verification tags, etc.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monetization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>AdSense Publisher ID</Label>
            <Input value={settings.adsense_client_id ?? ''} onChange={(e) => update('adsense_client_id', e.target.value)} className="mt-1" placeholder="ca-pub-XXXXXXXXX" />
            <p className="mt-1 text-xs text-muted-foreground">AdSense script will be auto-loaded site-wide.</p>
          </div>
          <Separator />
          <div>
            <Label>ads.txt Content</Label>
            <Textarea
              value={settings.ads_txt_content ?? ''}
              onChange={(e) => update('ads_txt_content', e.target.value)}
              className="mt-1 font-mono text-xs"
              rows={6}
              placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This content will be served at <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">/ads.txt</code>. Paste your AdSense or ad network entries here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Locales</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Currently English-only. Additional languages can be enabled here in a future update.
          </p>
          <div className="flex items-center gap-3">
            <Badge>en (English)</Badge>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// ─────────────────── Blog Tab ───────────────────

type BlogSubTab = 'posts' | 'categories' | 'tags' | 'ai-generate'

function BlogTab({ secret }: { secret: string }) {
  const [subTab, setSubTab] = useState<BlogSubTab>('posts')

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Management</h2>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {([
          { id: 'posts' as const, label: 'Posts', icon: <FileText size={14} /> },
          { id: 'categories' as const, label: 'Categories', icon: <FolderOpen size={14} /> },
          { id: 'tags' as const, label: 'Tags', icon: <Tag size={14} /> },
          { id: 'ai-generate' as const, label: 'AI Generator', icon: <Sparkles size={14} /> },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              subTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'posts' && <BlogPostsSubTab secret={secret} />}
      {subTab === 'categories' && <BlogCategoriesSubTab secret={secret} />}
      {subTab === 'tags' && <BlogTagsSubTab secret={secret} />}
      {subTab === 'ai-generate' && <BlogAIGeneratorSubTab secret={secret} />}
    </>
  )
}

function BlogPostsSubTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  const fetchPosts = useCallback(async (p = 1, q = '', s = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '10', search: q })
    if (s) params.set('status', s)
    const res = await fetch(`/api/admin/blog/posts?${params}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) {
      const data = await res.json()
      setPosts(data.posts)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPage(data.page)
    }
    setLoading(false)
  }, [secret])

  const fetchMeta = useCallback(async () => {
    const [cRes, tRes] = await Promise.all([
      fetch('/api/admin/blog/categories', { headers: { Authorization: `Bearer ${secret}` } }),
      fetch('/api/admin/blog/tags', { headers: { Authorization: `Bearer ${secret}` } }),
    ])
    if (cRes.ok) setCategories(await cRes.json())
    if (tRes.ok) setTags(await tRes.json())
  }, [secret])

  useEffect(() => { fetchPosts(); fetchMeta() }, [fetchPosts, fetchMeta])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this blog post permanently?')) return
    const res = await fetch(`/api/admin/blog/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) {
      toast('Post deleted', 'success')
      fetchPosts(page, search, statusFilter)
    }
  }, [secret, page, search, statusFilter, fetchPosts, toast])

  const handleSave = useCallback(async (formData: any) => {
    const isNew = !formData.id
    const url = isNew ? '/api/admin/blog/posts' : `/api/admin/blog/posts/${formData.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      toast(isNew ? 'Post created' : 'Post updated', 'success')
      setShowEditor(false)
      setEditing(null)
      fetchPosts(page, search, statusFilter)
    } else {
      const data = await res.json()
      toast(data.error || 'Failed to save post', 'error')
    }
  }, [secret, page, search, statusFilter, fetchPosts, toast])

  const handleDuplicate = useCallback(async (postId: string) => {
    const res = await fetch(`/api/admin/blog/posts/${postId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) return
    const original = await res.json()
    const dupeData = {
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36)}`,
      excerpt: original.excerpt,
      body: original.body,
      featured_image: original.featured_image,
      status: 'draft',
      author: original.author,
      reading_time: original.reading_time,
      meta_title: original.meta_title,
      meta_description: original.meta_description,
      og_image: original.og_image,
      is_featured: false,
      category_ids: (original.blog_post_categories ?? []).map((r: any) => r.category_id ?? r.blog_categories?.id).filter(Boolean),
      tag_ids: (original.blog_post_tags ?? []).map((r: any) => r.tag_id ?? r.blog_tags?.id).filter(Boolean),
    }
    const createRes = await fetch('/api/admin/blog/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(dupeData),
    })
    if (createRes.ok) {
      toast('Post duplicated as draft', 'success')
      fetchPosts(page, search, statusFilter)
    } else {
      toast('Failed to duplicate', 'error')
    }
  }, [secret, page, search, statusFilter, fetchPosts, toast])

  if (showEditor) {
    return (
      <BlogPostEditor
        post={editing}
        categories={categories}
        tags={tags}
        onSave={handleSave}
        onCancel={() => { setShowEditor(false); setEditing(null) }}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchPosts(1, e.target.value, statusFilter) }}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchPosts(1, search, e.target.value) }}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <Button onClick={() => { setEditing(null); setShowEditor(true) }}>
          <Plus size={14} /> New Post
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No blog posts found</div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => {
                const cats = (post.blog_post_categories ?? []).map((r: any) => r.blog_categories).filter(Boolean)
                return (
                  <div key={post.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{post.title}</p>
                        <Badge variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'outline'}>
                          {post.status}
                        </Badge>
                        {post.is_featured && (
                          <Badge variant="default" className="bg-amber-500 text-white text-[10px]">Featured</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>{post.reading_time} min read</span>
                        <span>{post.views ?? 0} views</span>
                        {cats.map((c: any) => (
                          <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="View"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDuplicate(post.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => { setEditing(post); setShowEditor(true) }}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{total} post{total !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchPosts(page - 1, search, statusFilter)}>
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchPosts(page + 1, search, statusFilter)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

function BlogPostEditor({
  post,
  categories,
  tags,
  onSave,
  onCancel,
}: {
  post: any | null
  categories: any[]
  tags: any[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const existingCatIds = (post?.blog_post_categories ?? []).map((r: any) => r.category_id ?? r.blog_categories?.id).filter(Boolean)
  const existingTagIds = (post?.blog_post_tags ?? []).map((r: any) => r.tag_id ?? r.blog_tags?.id).filter(Boolean)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? '')
  const [status, setStatus] = useState(post?.status ?? 'draft')
  const [author, setAuthor] = useState(post?.author ?? 'GifHub Team')
  const [readingTime, setReadingTime] = useState(post?.reading_time ?? 1)
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '')
  const [ogImage, setOgImage] = useState(post?.og_image ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url ?? '')
  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false)
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(existingCatIds))
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(existingTagIds))
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'content' | 'seo' | 'settings'>('content')

  const generateSlug = useCallback((text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }, [])

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val)
    if (!post) setSlug(generateSlug(val))
  }, [post, generateSlug])

  const calcReadingTime = useCallback((html: string) => {
    const text = html.replace(/<[^>]*>/g, '')
    const words = text.split(/\s+/).filter(Boolean).length
    setReadingTime(Math.max(1, Math.round(words / 200)))
  }, [])

  const handleBodyChange = useCallback((html: string) => {
    setBody(html)
    calcReadingTime(html)
  }, [calcReadingTime])

  const handleSubmit = useCallback(async () => {
    setSaving(true)
    await onSave({
      ...(post ? { id: post.id } : {}),
      title,
      slug,
      excerpt,
      body,
      featured_image: featuredImage || null,
      status,
      author,
      reading_time: readingTime,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      og_image: ogImage || null,
      canonical_url: canonicalUrl || null,
      is_featured: isFeatured,
      category_ids: Array.from(selectedCats),
      tag_ids: Array.from(selectedTags),
    })
    setSaving(false)
  }, [post, title, slug, excerpt, body, featuredImage, status, author, readingTime, metaTitle, metaDescription, ogImage, canonicalUrl, isFeatured, selectedCats, selectedTags, onSave])

  const toggleCat = useCallback((id: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const toggleTag = useCallback((id: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-xl font-bold">{post ? 'Edit Post' : 'New Post'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'default' : status === 'scheduled' ? 'secondary' : 'outline'}>
            {status}
          </Badge>
          <Button onClick={handleSubmit} disabled={saving || !title || !slug}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {post ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {([
          { id: 'content' as const, label: 'Content' },
          { id: 'seo' as const, label: 'SEO' },
          { id: 'settings' as const, label: 'Settings' },
        ]).map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeSection === s.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'content' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" />
            </div>
          </div>

          <div>
            <Label>Excerpt</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary..." rows={2} />
          </div>

          <div>
            <Label>Featured Image URL</Label>
            <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." />
            {featuredImage && (
              <div className="mt-2 h-32 w-full overflow-hidden rounded-lg border border-border">
                <img src={featuredImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <Label>Categories</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all',
                    selectedCats.has(cat.id) ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all',
                    selectedTags.has(tag.id) ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Body editor */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Body</Label>
              <span className="text-xs text-muted-foreground">{readingTime} min read</span>
            </div>
            <RichTextEditor content={body} onChange={handleBodyChange} />
          </div>
        </div>
      )}

      {activeSection === 'seo' && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">SEO fields control how this post appears in search engines and social media.</p>
            <Separator />
            <div>
              <Label>Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || 'Custom title for search engines'} />
              <p className="mt-1 text-xs text-muted-foreground">{(metaTitle || title).length}/60 characters</p>
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder={excerpt || 'Custom description for search engines'} rows={2} />
              <p className="mt-1 text-xs text-muted-foreground">{(metaDescription || excerpt).length}/160 characters</p>
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder={featuredImage || 'https://...'} />
              <p className="mt-1 text-xs text-muted-foreground">Image for social sharing (1200x630 recommended)</p>
            </div>
            <div>
              <Label>Canonical URL</Label>
              <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://gifhub.app/blog/..." />
              <p className="mt-1 text-xs text-muted-foreground">Only set if this content exists elsewhere</p>
            </div>

            {/* SEO Preview */}
            <div>
              <Label>Search Preview</Label>
              <div className="mt-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                  {metaTitle || title || 'Post Title'} | GifHub Blog
                </p>
                <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
                  gifhub.app/blog/{slug || 'post-slug'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {metaDescription || excerpt || 'Post description will appear here...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'settings' && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <Label>Author</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="GifHub Team" />
              </div>
            </div>
            <div>
              <Label>Reading Time (min)</Label>
              <Input type="number" value={readingTime} onChange={(e) => setReadingTime(Number(e.target.value))} min={1} />
              <p className="mt-1 text-xs text-muted-foreground">Auto-calculated from body content, but you can override.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured Post</Label>
                <p className="text-xs text-muted-foreground">Show this post as a hero banner on the blog listing page.</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function BlogCategoriesSubTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/blog/categories', { headers: { Authorization: `Bearer ${secret}` } })
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }, [secret])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const resetForm = useCallback(() => {
    setName(''); setSlug(''); setDescription(''); setMetaTitle(''); setMetaDescription('')
    setEditItem(null); setShowForm(false)
  }, [])

  const handleEdit = useCallback((cat: any) => {
    setEditItem(cat)
    setName(cat.name); setSlug(cat.slug); setDescription(cat.description ?? '')
    setMetaTitle(cat.meta_title ?? ''); setMetaDescription(cat.meta_description ?? '')
    setShowForm(true)
  }, [])

  const handleSave = useCallback(async () => {
    const payload = { name, slug, description, meta_title: metaTitle, meta_description: metaDescription }
    const url = editItem ? `/api/admin/blog/categories/${editItem.id}` : '/api/admin/blog/categories'
    const method = editItem ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast(editItem ? 'Category updated' : 'Category created', 'success')
      resetForm(); fetchCategories()
    } else {
      const data = await res.json()
      toast(data.error || 'Failed to save', 'error')
    }
  }, [editItem, name, slug, description, metaTitle, metaDescription, secret, toast, resetForm, fetchCategories])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this blog category?')) return
    const res = await fetch(`/api/admin/blog/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) { toast('Category deleted', 'success'); fetchCategories() }
  }, [secret, toast, fetchCategories])

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} blog categories</p>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={14} /> New Category
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!editItem) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} /></div>
            <div><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
            <div><Label>Meta Title</Label><Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
            <div><Label>Meta Description</Label><Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || !slug}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No blog categories yet</div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">/blog/category/{cat.slug}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => handleEdit(cat)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function BlogTagsSubTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const fetchTags = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/blog/tags', { headers: { Authorization: `Bearer ${secret}` } })
    if (res.ok) setTags(await res.json())
    setLoading(false)
  }, [secret])

  useEffect(() => { fetchTags() }, [fetchTags])

  const resetForm = useCallback(() => {
    setName(''); setSlug(''); setEditItem(null); setShowForm(false)
  }, [])

  const handleEdit = useCallback((tag: any) => {
    setEditItem(tag); setName(tag.name); setSlug(tag.slug); setShowForm(true)
  }, [])

  const handleSave = useCallback(async () => {
    const url = editItem ? `/api/admin/blog/tags/${editItem.id}` : '/api/admin/blog/tags'
    const method = editItem ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    if (res.ok) {
      toast(editItem ? 'Tag updated' : 'Tag created', 'success')
      resetForm(); fetchTags()
    } else {
      const data = await res.json()
      toast(data.error || 'Failed to save', 'error')
    }
  }, [editItem, name, slug, secret, toast, resetForm, fetchTags])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this blog tag?')) return
    const res = await fetch(`/api/admin/blog/tags/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) { toast('Tag deleted', 'success'); fetchTags() }
  }, [secret, toast, fetchTags])

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tags.length} blog tags</p>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={14} /> New Tag
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Tag' : 'New Tag'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!editItem) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} /></div>
            <div><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || !slug}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-primary" /></div>
          ) : tags.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No blog tags yet</div>
          ) : (
            <div className="flex flex-wrap gap-2 p-4">
              {tags.map((tag) => (
                <div key={tag.id} className="group flex items-center gap-1.5 rounded-full border border-border pl-3 pr-1.5 py-1">
                  <span className="text-sm">{tag.name}</span>
                  <button onClick={() => handleEdit(tag)} className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// ─────────────────── Blog AI Generator ───────────────────

type AIGenStatus = 'idle' | 'generating' | 'success' | 'error'

function BlogAIGeneratorSubTab({ secret }: { secret: string }) {
  const { toast } = useToast()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [generateImage, setGenerateImage] = useState(true)
  const [status, setStatus] = useState<AIGenStatus>('idle')
  const [result, setResult] = useState<any>(null)
  const [log, setLog] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<Array<{ title: string; slug: string; id: string; created: string }>>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/blog/categories', { headers: { Authorization: `Bearer ${secret}` } }).then((r) => r.json()),
      fetch('/api/admin/blog/tags', { headers: { Authorization: `Bearer ${secret}` } }).then((r) => r.json()),
    ]).then(([cats, tgs]) => {
      setCategories(Array.isArray(cats) ? cats : [])
      setTags(Array.isArray(tgs) ? tgs : [])
    })
  }, [secret])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleTag = useCallback((id: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return
    setStatus('generating')
    setResult(null)
    setLog(['Starting AI blog generation...'])

    try {
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          length,
          category_ids: [...selectedCategories],
          tag_ids: [...selectedTags],
          generate_image: generateImage,
        }),
      })

      const data = await res.json()

      if (data.log) setLog(data.log)

      if (data.success) {
        setStatus('success')
        setResult(data.post)
        setHistory((prev) => [
          { title: data.post.title, slug: data.post.slug, id: data.post.id, created: new Date().toISOString() },
          ...prev,
        ])
        toast(`Blog post "${data.post.title}" generated as draft`, 'success')
      } else {
        setStatus('error')
        toast(data.error || 'Generation failed', 'error')
      }
    } catch (err: any) {
      setStatus('error')
      setLog((prev) => [...prev, `Error: ${err?.message ?? 'Unknown'}`])
      toast('Generation failed', 'error')
    }
  }, [topic, tone, length, selectedCategories, selectedTags, generateImage, secret, toast])

  const toneOptions = [
    { value: 'professional', label: 'Professional', desc: 'Formal, business-oriented' },
    { value: 'conversational', label: 'Conversational', desc: 'Friendly, approachable' },
    { value: 'educational', label: 'Educational', desc: 'Tutorial-style, instructive' },
    { value: 'thought-leadership', label: 'Thought Leadership', desc: 'Authoritative, visionary' },
    { value: 'data-driven', label: 'Data-Driven', desc: 'Stats-heavy, analytical' },
  ]

  const lengthOptions = [
    { value: 'short', label: 'Short', desc: '600-800 words' },
    { value: 'medium', label: 'Medium', desc: '1000-1300 words' },
    { value: 'long', label: 'Long', desc: '1500-2000 words' },
  ]

  const topicSuggestions = [
    'How to Use GIFs in Professional Slack Communication',
    'The Psychology Behind GIF Marketing in 2026',
    'Top 10 Business GIF Trends for Digital Marketing',
    'GIF Etiquette: A Complete Guide for the Workplace',
    'How GIFs Increase Email Open Rates by 42%',
    'Building a GIF Strategy for Your SaaS Product',
    'The ROI of Visual Communication in Remote Teams',
    'GIF Accessibility: Making Visual Content Inclusive',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">AI Blog Generator</h3>
          <p className="text-sm text-muted-foreground">Powered by Gemini 2.5 Pro + Imagen 3</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Config */}
        <div className="space-y-4 lg:col-span-2">
          {/* Topic */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe what you want the blog post to be about..."
                className="min-h-[100px] resize-none"
              />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {topicSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTopic(s)}
                      className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tone + Length */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {toneOptions.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-colors',
                        tone === t.value
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 h-3.5 w-3.5 rounded-full border-2 flex-shrink-0',
                        tone === t.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {lengthOptions.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value)}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-colors',
                        length === l.value
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 h-3.5 w-3.5 rounded-full border-2 flex-shrink-0',
                        length === l.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Generate Image</p>
                    <p className="text-xs text-muted-foreground">Imagen 3 featured image</p>
                  </div>
                  <Switch checked={generateImage} onCheckedChange={setGenerateImage} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories + Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 text-xs text-muted-foreground">Blog Categories</Label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-all',
                        selectedCategories.has(cat.id)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground">No blog categories found. Create some in the Categories tab.</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 text-xs text-muted-foreground">Blog Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-all',
                        selectedTags.has(tag.id)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-xs text-muted-foreground">No blog tags found. Create some in the Tags tab.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || status === 'generating'}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 py-6 text-base font-semibold text-white hover:from-violet-700 hover:to-purple-700"
            size="lg"
          >
            {status === 'generating' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>

        {/* Sidebar: Log + History */}
        <div className="space-y-4">
          {/* Live Log */}
          {log.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {status === 'generating' && <Loader2 size={14} className="animate-spin text-primary" />}
                  {status === 'success' && <CheckCircle2 size={14} className="text-green-500" />}
                  {status === 'error' && <XCircle size={14} className="text-red-500" />}
                  Generation Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto rounded-lg bg-muted/50 p-3 font-mono text-xs">
                  {log.map((entry, i) => (
                    <div key={i} className="py-0.5 text-muted-foreground">
                      <span className="mr-1 text-primary/60">&gt;</span>
                      {entry}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                  <CheckCircle2 size={16} />
                  Post Generated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{result.title}</p>
                  <p className="text-xs text-muted-foreground">/{result.slug}</p>
                </div>
                {result.featured_image && (
                  <img
                    src={result.featured_image}
                    alt="Generated featured image"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Draft</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  The post has been saved as a draft. Go to the Posts tab to review, edit, and publish it.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => window.open(`/blog/${result.slug}`, '_blank')}
                >
                  <Eye size={14} /> Preview Post
                </Button>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${item.slug}`, '_blank')}>
                        <ExternalLink size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-violet-500" />
                  <p><strong className="text-foreground">Gemini 2.5 Pro</strong> generates SEO-optimized content with internal links, meta tags, and Schema.org support.</p>
                </div>
                <div className="flex items-start gap-2">
                  <ImageIcon size={14} className="mt-0.5 flex-shrink-0 text-violet-500" />
                  <p><strong className="text-foreground">Imagen 3</strong> creates professional 16:9 featured images auto-uploaded to your storage.</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText size={14} className="mt-0.5 flex-shrink-0 text-violet-500" />
                  <p>Posts are saved as <strong className="text-foreground">drafts</strong> — review and publish from the Posts tab.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─────────────────── Pipeline Tab ───────────────────

function PipelineTab({ secret, stats, fetchStats }: { secret: string; stats: Stats | null; fetchStats: () => Promise<void> }) {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle')
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [secret])

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [pipelineResult?.log?.length])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const canRunPipeline = stats?.config && (stats.config.giphy || stats.config.tenor) && stats.config.gemini

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCategories(new Set(categories.map((c) => c.id)))
  }, [categories])

  const clearAll = useCallback(() => {
    setSelectedCategories(new Set())
  }, [])

  const runPipeline = useCallback(async () => {
    setPipelineStatus('running')
    setPipelineResult(null)
    setElapsedTime(0)
    const startTime = Date.now()
    timerRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000)
      const params = selectedCategories.size > 0
        ? `?categories=${Array.from(selectedCategories).join(',')}`
        : ''
      const res = await fetch(`/api/cron/scrape${params}`, {
        headers: { Authorization: `Bearer ${secret}` },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data: PipelineResult = await res.json()
      setPipelineResult(data)
      setPipelineStatus(data.success ? 'success' : 'error')
      await fetchStats()
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      setPipelineResult({
        success: false,
        error: isAbort ? 'Pipeline timed out after 10 minutes.' : err instanceof Error ? err.message : 'Network error',
        log: [],
      })
      setPipelineStatus('error')
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [secret, fetchStats, selectedCategories])

  return (
    <>
      <h2 className="text-2xl font-bold">AI Scraping Pipeline</h2>

      {stats?.config && <SetupStatus config={stats.config} />}

      {/* Category Selection */}
      {categories.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium">Target Categories</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategories.size === 0
                    ? 'All categories (random selection)'
                    : `${selectedCategories.size} categor${selectedCategories.size === 1 ? 'y' : 'ies'} selected`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.has(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'border border-border text-muted-foreground hover:border-primary/30 hover:text-primary'
                    )}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Gemini generates queries &rarr; APIs fetch GIFs &rarr; Gemini validates &rarr; Supabase stores</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCategories.size > 0
                  ? `Will process subcategories from ${selectedCategories.size} selected categor${selectedCategories.size === 1 ? 'y' : 'ies'}.`
                  : 'Will pick random subcategories from all categories.'}
              </p>
            </div>
            <Button onClick={runPipeline} disabled={pipelineStatus === 'running' || !canRunPipeline} size="lg">
              {pipelineStatus === 'running' ? (
                <><Loader2 size={14} className="animate-spin" /> Running... {elapsedTime}s</>
              ) : (
                <><Play size={14} /> Run Pipeline</>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {pipelineStatus !== 'idle' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  {pipelineStatus === 'running' && <span className="flex items-center gap-1.5 text-sm text-yellow-500"><Clock size={14} /> Running...</span>}
                  {pipelineStatus === 'success' && <span className="flex items-center gap-1.5 text-sm text-green-500"><CheckCircle2 size={14} /> Completed in {elapsedTime}s</span>}
                  {pipelineStatus === 'error' && <span className="flex items-center gap-1.5 text-sm text-red-500"><XCircle size={14} /> Failed{pipelineResult?.error && `: ${pipelineResult.error}`}</span>}
                </div>

                {pipelineResult?.stats && (
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniStat label="Fetched" value={pipelineResult.stats.scraped} />
                    <MiniStat label="Validated" value={pipelineResult.stats.validated} />
                    <MiniStat label="Inserted" value={pipelineResult.stats.inserted} color="green" />
                    <MiniStat label="Skipped" value={pipelineResult.stats.skipped} color="yellow" />
                  </div>
                )}

                {pipelineResult?.log && pipelineResult.log.length > 0 && (
                  <div className="max-h-72 overflow-y-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed">
                    {pipelineResult.log.map((line, i) => (
                      <div key={i} className={`py-0.5 ${line.includes('ABORT') || line.includes('FATAL') || line.includes('ERROR') ? 'text-red-500' : line.includes('Done') || line.includes('Completed') ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <span className="mr-2 select-none text-primary/40">[{i + 1}]</span>{line}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  )
}

// ─────────────────── Shared Components ───────────────────

function SetupStatus({ config }: { config: ConfigStatus }) {
  const allGood = config.supabase && config.gemini && (config.giphy || config.tenor)

  if (allGood) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
        <CheckCircle2 size={16} className="shrink-0 text-green-500" />
        <span className="text-sm text-green-700 dark:text-green-400">All systems configured. Pipeline is ready to run.</span>
      </div>
    )
  }

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Settings size={16} className="text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Setup Required</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <ConfigItem label="Supabase" ok={config.supabase} hint="SUPABASE_SERVICE_ROLE_KEY" />
          <ConfigItem label="Gemini AI" ok={config.gemini} hint="GEMINI_API_KEY" />
          <ConfigItem label="Giphy API" ok={config.giphy} hint="GIPHY_API_KEY" link="https://developers.giphy.com/dashboard/?create=true" />
          <ConfigItem label="Tenor API" ok={config.tenor} hint="TENOR_API_KEY" link="https://console.cloud.google.com/apis/api/tenor.googleapis.com" />
        </div>
      </CardContent>
    </Card>
  )
}

function ConfigItem({ label, ok, hint, link }: { label: string; ok: boolean; hint: string; link?: string }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${ok ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-500" />}
        <span className={ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{label}</span>
      </div>
      {!ok && link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
          Get key <ExternalLink size={10} />
        </a>
      ) : !ok ? (
        <code className="text-[10px] text-muted-foreground">{hint}</code>
      ) : null}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClass = color === 'green' ? 'text-green-500' : color === 'yellow' ? 'text-yellow-500' : 'text-card-foreground'
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}
