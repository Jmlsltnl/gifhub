import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — GifHub',
  description: 'Read the terms and conditions for using GifHub, the professional GIF platform.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Last updated: April 2026
          </p>
        </section>

        <div className="space-y-10">
          <TermsSection title="1. Acceptance of Terms">
            <p>
              By accessing or using GifHub (&quot;the Platform&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not
              use the Platform.
            </p>
          </TermsSection>

          <TermsSection title="2. Description of Service">
            <p>
              GifHub is a free platform that allows users to discover, search, share, and
              download GIF images for personal and professional use. The Platform curates
              GIFs from various sources and provides tools for organizing and sharing them.
            </p>
          </TermsSection>

          <TermsSection title="3. Acceptable Use">
            <p>You agree to use GifHub in accordance with these guidelines:</p>
            <ul>
              <li>Use the Platform for lawful purposes only</li>
              <li>Do not attempt to disrupt, overload, or interfere with the Platform&apos;s infrastructure</li>
              <li>Do not use automated tools to scrape or download GIFs in bulk</li>
              <li>Do not redistribute GIFs in a way that competes with GifHub</li>
              <li>Do not use the Platform to harass, abuse, or harm others</li>
            </ul>
          </TermsSection>

          <TermsSection title="4. GIF Content & Licensing">
            <p>
              GIFs on GifHub are sourced from third-party providers (including Giphy and Tenor)
              and are subject to their respective licensing terms. GifHub acts as a curation
              and discovery layer:
            </p>
            <ul>
              <li><strong>Personal & Business Use:</strong> You may use GIFs found on GifHub
              for personal communication, internal business communication (Slack, Teams, email),
              and presentations.</li>
              <li><strong>Attribution:</strong> While not required, we appreciate when users credit
              GifHub as the source when sharing GIFs externally.</li>
              <li><strong>Commercial Use:</strong> For commercial use in advertising, products, or
              publications, please verify the specific licensing terms of the original GIF source.</li>
              <li><strong>No Ownership Claim:</strong> GifHub does not claim ownership over the GIF
              content. Original creators retain their rights.</li>
            </ul>
          </TermsSection>

          <TermsSection title="5. User-Generated Data">
            <p>
              Certain features store data locally in your browser:
            </p>
            <ul>
              <li><strong>Favorites & Collections:</strong> Stored in your browser&apos;s local storage.
              We do not back up or sync this data — clearing your browser data will remove it.</li>
              <li><strong>Search History:</strong> Stored locally for your convenience.
              You can clear it at any time via the search interface.</li>
              <li><strong>Likes:</strong> Recorded server-side with IP-based deduplication.
              One like per IP address per GIF.</li>
            </ul>
          </TermsSection>

          <TermsSection title="6. Availability & Changes">
            <p>
              We strive to keep GifHub available 24/7, but we do not guarantee uninterrupted
              service. We reserve the right to:
            </p>
            <ul>
              <li>Modify, suspend, or discontinue any feature of the Platform</li>
              <li>Remove GIFs or categories at our discretion</li>
              <li>Update these terms with reasonable notice</li>
            </ul>
          </TermsSection>

          <TermsSection title="7. Disclaimer of Warranties">
            <p>
              GifHub is provided &quot;as is&quot; and &quot;as available&quot; without warranties
              of any kind, express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The Platform will be error-free or uninterrupted</li>
              <li>GIFs will always be available or accurate</li>
              <li>The Platform will meet your specific requirements</li>
            </ul>
          </TermsSection>

          <TermsSection title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, GifHub shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising
              from your use of the Platform.
            </p>
          </TermsSection>

          <TermsSection title="9. Intellectual Property">
            <p>
              The GifHub name, logo, design, and codebase are proprietary. You may not
              copy, modify, or redistribute any part of the Platform&apos;s design or code
              without written permission.
            </p>
          </TermsSection>

          <TermsSection title="10. Contact">
            <p>
              For questions about these terms, please reach out via our{' '}
              <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </TermsSection>
        </div>
      </main>
      <Footer />
    </>
  )
}

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
      <h2 className="mb-3 text-lg font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:hover:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
