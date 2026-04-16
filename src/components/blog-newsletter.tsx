'use client'

import { useState, useCallback } from 'react'
import { Mail, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

export function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    await new Promise((r) => setTimeout(r, 1200))
    setStatus('success')
    setEmail('')
  }, [email])

  if (status === 'success') {
    return (
      <div className="my-10 rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center">
        <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500" />
        <p className="text-lg font-bold text-foreground">You&apos;re subscribed!</p>
        <p className="mt-1 text-sm text-muted-foreground">We&apos;ll send you the best GIF tips and insights. No spam.</p>
      </div>
    )
  }

  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
        <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mb-0">
          <Sparkles size={22} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Get GIF Tips in Your Inbox</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly insights on using GIFs for business communication, marketing strategies, and workplace culture. Join 2,000+ professionals.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {status === 'loading' ? (
                <><Loader2 size={14} className="animate-spin" /> Subscribing...</>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground/60">No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  )
}
