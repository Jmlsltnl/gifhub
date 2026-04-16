import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BookOpen, MessageSquare, Mail, Presentation, Code2, Copy, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Integration Guides — How to Use GIFs at Work | GifHub',
  description: 'Learn how to use GIFs from GifHub in Slack, Microsoft Teams, Email, PowerPoint, and more. Step-by-step guides for professional GIF usage.',
}

export default function GuidesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Integration Guides
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Learn how to use GifHub GIFs in your favorite workplace tools.
            Each guide includes step-by-step instructions and pro tips.
          </p>
        </section>

        <div className="space-y-8">
          <GuideCard
            icon={<SlackIcon />}
            title="Slack"
            description="Add GIFs to your Slack messages, channels, and threads."
            steps={[
              'Find a GIF on GifHub and click "Copy Link" or use the Slack share button',
              'Paste the GIF URL directly into any Slack message — Slack auto-unfurls it with a preview',
              'For inline GIFs, paste the direct image URL (from GIF Details panel) — Slack will embed the image',
              'Pro tip: Use the /giphy command? GifHub GIFs have better curation for business contexts',
            ]}
            proTip="Bookmark your favorite GIFs in GifHub Collections so you can quickly find them during conversations."
          />

          <GuideCard
            icon={<TeamsIcon />}
            title="Microsoft Teams"
            description="Share GIFs in Teams chats, channels, and meetings."
            steps={[
              'Find a GIF on GifHub and click the "Share to Workspace" button',
              'Click "Teams" to open the Microsoft Teams share dialog',
              'Alternatively, copy the direct GIF URL and paste it in any Teams conversation',
              'Teams will automatically preview the GIF inline in the chat',
            ]}
            proTip="Use GifHub&apos;s search to find context-appropriate GIFs — our AI ensures every GIF is workplace-safe."
          />

          <GuideCard
            icon={<Mail size={22} />}
            title="Email & Newsletters"
            description="Embed GIFs in emails to increase engagement."
            steps={[
              'Find a GIF and click "Show embed codes" in the Embed section',
              'Copy the HTML embed code',
              'In your email editor, switch to HTML mode and paste the code',
              'For Outlook: paste the direct GIF URL as an image, then resize as needed',
              'For Gmail: drag and drop the GIF image, or paste the URL in compose',
            ]}
            proTip="Keep email GIFs under 1MB for reliable delivery. GifHub shows file format and dimensions in the GIF Details panel."
          />

          <GuideCard
            icon={<Presentation size={22} />}
            title="PowerPoint & Google Slides"
            description="Make your presentations more engaging with GIFs."
            steps={[
              'Find the perfect GIF on GifHub and click "Download"',
              'In PowerPoint: Insert → Pictures → choose the downloaded GIF file',
              'In Google Slides: Insert → Image → Upload from computer',
              'Resize and position the GIF on your slide — it will animate during the slideshow',
              'For online presentations, you can also use Insert → Image → By URL with the direct GIF link',
            ]}
            proTip="GIFs play automatically in both PowerPoint and Google Slides during presentations. Use them for reactions, transitions, or to illustrate a point."
          />

          <GuideCard
            icon={<Code2 size={22} />}
            title="Websites & Blogs"
            description="Embed GifHub GIFs on your website or blog."
            steps={[
              'Find a GIF and open the "Embed" section on the GIF detail page',
              'Choose your format: HTML, Markdown, or BBCode',
              'Copy the embed code and paste it into your content',
              'The HTML embed includes a link back to GifHub and proper alt text for SEO',
            ]}
            proTip="Use the Markdown format for GitHub READMEs, blog posts, and documentation."
          />

          <GuideCard
            icon={<Copy size={22} />}
            title="Notion, Confluence & Docs"
            description="Add GIFs to your team documentation."
            steps={[
              'Find a GIF on GifHub and copy the direct GIF URL from the GIF Details panel',
              'In Notion: type /image, choose "Embed link", and paste the URL',
              'In Confluence: use the Image macro and paste the URL',
              'In Google Docs: Insert → Image → By URL',
            ]}
            proTip="GIFs in documentation make onboarding guides, runbooks, and process docs more engaging and easier to follow."
          />
        </div>

        {/* CTA */}
        <section className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center dark:from-primary/15 dark:via-primary/5">
          <h2 className="text-xl font-bold">Ready to level up your communication?</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Browse our curated library and find the perfect GIF for any situation.
          </p>
          <a
            href="/explore"
            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            Explore GIFs
          </a>
        </section>
      </main>
      <Footer />
    </>
  )
}

function GuideCard({
  icon,
  title,
  description,
  steps,
  proTip,
}: {
  icon: React.ReactNode
  title: string
  description: string
  steps: string[]
  proTip: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <ol className="mt-5 space-y-2.5 pl-4">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl bg-primary/5 px-4 py-3 dark:bg-primary/10">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-primary">Pro tip: </span>
          {proTip}
        </p>
      </div>
    </div>
  )
}

function SlackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
