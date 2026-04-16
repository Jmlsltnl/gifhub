'use client'

import { useEffect, useState } from 'react'

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const article = document.querySelector('article')
      if (!article) return

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = article.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollY = window.scrollY

      const start = articleTop
      const end = articleTop + articleHeight - viewportHeight

      if (scrollY <= start) {
        setProgress(0)
      } else if (scrollY >= end) {
        setProgress(100)
      } else {
        setProgress(Math.round(((scrollY - start) / (end - start)) * 100))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <div
        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
