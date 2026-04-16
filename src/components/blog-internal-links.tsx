import { Link } from '@/i18n/navigation'
import { ArrowRight, Sparkles, TrendingUp, Folder, Compass, BookOpen, Code } from 'lucide-react'

const LINK_BLOCKS = [
  {
    icon: <Sparkles size={16} />,
    title: 'Discover Business GIFs',
    description: 'Browse our curated collection of professional GIFs.',
    href: '/explore',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: <TrendingUp size={16} />,
    title: 'Trending Right Now',
    description: 'See what GIFs are trending in the business world.',
    href: '/trending',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: <Folder size={16} />,
    title: 'Marketing GIFs',
    description: 'Perfect GIFs for campaigns, launches, and social.',
    href: '/category/marketing',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: <Compass size={16} />,
    title: 'SaaS & Tech GIFs',
    description: 'Celebrate MRR goals, product launches, and more.',
    href: '/category/saas',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: <BookOpen size={16} />,
    title: 'Integration Guides',
    description: 'Use GIFs in Slack, Teams, Email, and presentations.',
    href: '/guides',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: <Code size={16} />,
    title: 'Developer API',
    description: 'Integrate GifHub into your apps with our free API.',
    href: '/developers',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
]

export function BlogInternalLinks() {
  return (
    <div className="my-10 rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-bold text-foreground">Explore GifHub</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINK_BLOCKS.map((block) => (
          <Link
            key={block.href}
            href={block.href}
            className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary/20 hover:shadow-sm"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${block.bg} ${block.color}`}>
              {block.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {block.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {block.description}
              </p>
            </div>
            <ArrowRight size={14} className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  )
}
