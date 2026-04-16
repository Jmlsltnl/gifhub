'use client'

import { useState, useCallback } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

type FormState = 'idle' | 'sending' | 'sent'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast('Please fill in all required fields', 'error')
      return
    }
    setState('sending')

    // Simulate sending (no backend endpoint yet — can be connected later)
    await new Promise((r) => setTimeout(r, 1500))

    setState('sent')
    toast('Message sent successfully! We\'ll get back to you soon.', 'success')
  }, [name, email, message, toast])

  if (state === 'sent') {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold">Message Sent!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thank you for reaching out. We&apos;ll review your message and get back
          to you within 24–48 hours.
        </p>
        <button
          onClick={() => {
            setState('idle')
            setName('')
            setEmail('')
            setSubject('')
            setMessage('')
          }}
          className="mt-6 rounded-xl border border-border px-5 py-2 text-sm font-medium transition-all hover:bg-muted active:scale-95"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Name"
          required
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <FormField
          label="Email"
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
        />
      </div>

      <FormField
        label="Subject"
        value={subject}
        onChange={setSubject}
        placeholder="What's this about?"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind..."
          rows={5}
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 dark:bg-muted/20"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          We&apos;ll never share your email with anyone else.
        </p>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-60"
        >
          {state === 'sending' ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={14} />
              Send Message
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function FormField({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string
  required?: boolean
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 dark:bg-muted/20"
      />
    </div>
  )
}
