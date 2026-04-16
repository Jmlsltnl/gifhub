'use client'

import { useState, useCallback } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import { useToast } from '@/components/ui/toast'

interface BusinessShareProps {
  gifUrl: string
  pageUrl: string
  title: string
}

export function BusinessShare({ gifUrl, pageUrl, title }: BusinessShareProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = useCallback(async (text: string, label: string, toastMsg: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(label)
      toast(toastMsg, 'success')
      setTimeout(() => setCopied(null), 2000)
    }
  }, [toast])

  const slackMessage = `${title}\n${gifUrl}`
  const teamsUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(pageUrl)}&preview=true`
  const emailSubject = encodeURIComponent(`Check out this GIF: ${title}`)
  const emailBody = encodeURIComponent(`${title}\n\nView: ${pageUrl}\nDirect: ${gifUrl}`)
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`

  return (
    <div className="space-y-2">
      <ShareRow
        label="Slack"
        icon={<SlackIcon />}
        onClick={() => handleCopy(slackMessage, 'slack', 'Slack message copied — paste it in any channel')}
        copied={copied === 'slack'}
        hint="Copy message for Slack"
      />
      <ShareRow
        label="Teams"
        icon={<TeamsIcon />}
        onClick={() => window.open(teamsUrl, '_blank')}
        hint="Share to Microsoft Teams"
      />
      <ShareRow
        label="Email"
        icon={<Mail size={14} />}
        onClick={() => window.open(emailUrl)}
        hint="Send via email"
      />
      <ShareRow
        label="GIF URL"
        icon={<Copy size={14} />}
        onClick={() => handleCopy(gifUrl, 'gif', 'Direct GIF URL copied')}
        copied={copied === 'gif'}
        hint="Copy direct GIF link"
      />
    </div>
  )
}

function ShareRow({ label, icon, onClick, copied, hint }: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  copied?: boolean
  hint: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-border px-3.5 py-2.5 text-left text-sm transition-all hover:bg-muted active:scale-[0.98]',
        copied && 'border-green-500/30 bg-green-500/5'
      )}
      title={hint}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {copied ? <Check size={14} className="text-green-500" /> : icon}
      </span>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">
        {copied ? 'Copied!' : hint}
      </span>
    </button>
  )
}

function SlackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="2" width="3" height="8" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect x="8" y="14" width="3" height="8" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect x="14" y="13" width="8" height="3" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect x="2" y="8" width="8" height="3" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  )
}

function TeamsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
