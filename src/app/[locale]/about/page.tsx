import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Flame, Zap, Shield, Globe, Users, Sparkles, Heart, Download, Search } from 'lucide-react'
import { getGifCount, getCategories } from '@/lib/data'

export const metadata: Metadata = {
  title: 'About GifHub — The Professional GIF Platform for Business',
  description: 'GifHub is the professional GIF platform built for workplace communication. Discover curated, high-quality GIFs for Slack, Teams, email, and presentations.',
}

export default async function AboutPage() {
  const [totalGifs, categories] = await Promise.all([
    getGifCount(),
    getCategories(),
  ])

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl py-16 text-center sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 dark:from-primary/15 dark:via-primary/5 dark:to-transparent" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-[80px] dark:bg-primary/20" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-[60px] dark:bg-primary/15" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Flame size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              About <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">GifHub</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              The professional GIF platform built for workplace communication.
              We curate high-quality, business-appropriate GIFs so you can express
              yourself in Slack, Teams, email, and presentations.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBlock value={totalGifs.toLocaleString()} label="Curated GIFs" />
          <StatBlock value={String(categories.length)} label="Categories" />
          <StatBlock value="100%" label="Free to Use" />
          <StatBlock value="24/7" label="Available" />
        </section>

        {/* Mission */}
        <section className="mt-16">
          <SectionTitle>Our Mission</SectionTitle>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
              <h3 className="text-lg font-semibold">For Professionals</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We believe visual communication makes work more human. GifHub is designed
                specifically for the workplace — every GIF in our library is curated for
                professional contexts, from team celebrations to product launches.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
              <h3 className="text-lg font-semibold">AI-Curated Quality</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our AI pipeline reviews every GIF for quality, relevance, and professionalism
                before it enters the library. We source from the best providers and validate
                each GIF to ensure it meets our standards.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <SectionTitle>Platform Features</SectionTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search size={20} />}
              title="Smart Search"
              description="Find the perfect GIF instantly with AI-powered search across thousands of professionally curated GIFs."
            />
            <FeatureCard
              icon={<Download size={20} />}
              title="One-Click Download"
              description="Download GIFs instantly or copy them directly to your clipboard for pasting into Slack, Teams, or email."
            />
            <FeatureCard
              icon={<Users size={20} />}
              title="Business Sharing"
              description="Share GIFs directly to Slack, Microsoft Teams, email, or any workspace tool with dedicated sharing buttons."
            />
            <FeatureCard
              icon={<Shield size={20} />}
              title="Workplace Safe"
              description="Every GIF is reviewed for professional appropriateness. No surprises in your next team standup."
            />
            <FeatureCard
              icon={<Heart size={20} />}
              title="Collections & Favorites"
              description="Save your go-to GIFs and organize them into custom collections for quick access when you need them."
            />
            <FeatureCard
              icon={<Sparkles size={20} />}
              title="Daily Fresh Content"
              description="Our AI pipeline adds new, relevant GIFs daily across all categories, keeping your library fresh."
            />
          </div>
        </section>

        {/* Use Cases */}
        <section className="mt-16">
          <SectionTitle>How Teams Use GifHub</SectionTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <UseCaseCard
              emoji="🚀"
              title="Product Launches"
              description="Celebrate launches and milestones with the perfect reaction GIF that captures the team's excitement."
            />
            <UseCaseCard
              emoji="💬"
              title="Slack & Teams Conversations"
              description="Elevate your team chat with professional, on-point GIFs that make communication more engaging."
            />
            <UseCaseCard
              emoji="📊"
              title="Presentations & Decks"
              description="Add visual impact to your slides with embedded GIFs that keep your audience engaged."
            />
            <UseCaseCard
              emoji="📧"
              title="Email & Newsletters"
              description="Make your emails stand out with GIFs that convey tone and emotion better than text alone."
            />
          </div>
        </section>

        {/* Tech */}
        <section className="mt-16">
          <SectionTitle>Built with Modern Technology</SectionTitle>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Google AI', 'Framer Motion'].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground dark:bg-card/30"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center dark:from-primary/15 dark:via-primary/5 sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to find the perfect GIF?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Start browsing our curated library — it&apos;s completely free.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/explore"
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              Explore GIFs
            </a>
            <a
              href="/search"
              className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
            >
              Search Library
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 text-center dark:bg-card/30">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card/50 p-5 transition-all hover:border-primary/20 hover:shadow-md dark:bg-card/30">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function UseCaseCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card/50 p-5 dark:bg-card/30">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
        {emoji}
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
