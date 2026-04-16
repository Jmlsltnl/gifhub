import { Link } from '@/i18n/navigation'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blog-data'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-lg">
      {post.featured_image && (
        <Link href={`/blog/${post.slug}`} className="relative aspect-[2/1] overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        {post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/category/${cat.slug}`}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <Link href={`/blog/${post.slug}`} className="group/title">
          <h2 className="mb-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover/title:text-primary">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {publishDate && <time dateTime={post.published_at!}>{publishDate}</time>}
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {post.reading_time} min read
            </span>
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {post.views.toLocaleString()}
              </span>
            )}
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Read
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
