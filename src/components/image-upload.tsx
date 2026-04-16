'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  secret: string
  label?: string
  hint?: string
  aspectRatio?: string
}

export function ImageUpload({
  value,
  onChange,
  secret,
  label = 'Image',
  hint,
  aspectRatio = 'aspect-[2/1]',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    setError('')
    setUploading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
        body: form,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        onChange(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Network error during upload')
    } finally {
      setUploading(false)
    }
  }, [secret, onChange])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    if (inputRef.current) inputRef.current.value = ''
  }, [upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) upload(file)
  }, [upload])

  const handleUrlSubmit = useCallback(() => {
    if (urlValue.trim()) {
      onChange(urlValue.trim())
      setUrlValue('')
      setShowUrlInput(false)
    }
  }, [urlValue, onChange])

  if (value) {
    return (
      <div className="space-y-1.5">
        <div className={cn('relative overflow-hidden rounded-xl border border-border', aspectRatio)}>
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
        <p className="truncate text-xs text-muted-foreground">{value.split('/').pop()}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ImageIcon size={18} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Upload image
              </button>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
            </div>
            <p className="text-[11px] text-muted-foreground/60">JPEG, PNG, WebP, GIF, SVG up to 5MB</p>
          </>
        )}
      </div>

      {/* URL fallback */}
      {!uploading && (
        <div>
          {showUrlInput ? (
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                autoFocus
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlValue.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowUrlInput(false); setUrlValue('') }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link2 size={11} />
              Or paste image URL
            </button>
          )}
        </div>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
