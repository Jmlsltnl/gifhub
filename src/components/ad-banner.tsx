'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slot?: string
  format?: 'horizontal' | 'in-feed' | 'rectangle'
  className?: string
}

export function AdBanner({ slot = 'placeholder', format = 'horizontal', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const isAdSenseEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID)

  useEffect(() => {
    if (!isAdSenseEnabled || !adRef.current) return

    try {
      const w = window as any
      if (w.adsbygoogle) {
        w.adsbygoogle.push({})
      }
    } catch {
      // AdSense not loaded
    }
  }, [isAdSenseEnabled])

  const heightClass = format === 'rectangle' ? 'min-h-[250px]' : 'min-h-[90px]'

  if (!isAdSenseEnabled) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 px-4 py-6 text-xs text-muted-foreground ${heightClass} ${className}`}
        data-ad-slot={slot}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-widest opacity-50">Advertisement</span>
          <span>Ad Space — Google AdSense</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={adRef} className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format === 'in-feed' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  )
}
