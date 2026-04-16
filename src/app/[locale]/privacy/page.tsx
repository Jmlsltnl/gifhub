import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — GifHub',
  description: 'Learn how GifHub collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Last updated: April 2026
          </p>
        </section>

        <div className="space-y-10">
          <PolicySection title="1. Information We Collect">
            <p>
              GifHub is designed with privacy in mind. We collect minimal information
              to provide and improve our service:
            </p>
            <ul>
              <li><strong>Usage Data:</strong> We track anonymous page views and GIF interaction
              counts (views, likes) to improve content curation. No personal identifiers are attached.</li>
              <li><strong>IP Addresses:</strong> We store hashed IP addresses solely for the
              purpose of the like system (one like per IP per GIF). We do not use IP addresses
              for tracking or advertising.</li>
              <li><strong>Local Storage:</strong> Favorites, collections, search history, and
              recently viewed GIFs are stored in your browser&apos;s local storage. This data
              never leaves your device.</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Display and serve GIF content</li>
              <li>Power the like/dislike system with IP-based deduplication</li>
              <li>Track aggregate view counts for content curation</li>
              <li>Improve search relevance and content recommendations</li>
              <li>Monitor platform performance and fix technical issues</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Information Sharing">
            <p>
              We do not sell, trade, or transfer your personal information to third parties.
              We may share aggregated, anonymized statistics (e.g., total views, popular categories)
              publicly on the platform.
            </p>
          </PolicySection>

          <PolicySection title="4. Third-Party Services">
            <p>GifHub uses the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Database hosting and API infrastructure</li>
              <li><strong>Giphy & Tenor:</strong> GIF sourcing APIs for content ingestion</li>
              <li><strong>Google AI (Gemini):</strong> Content validation and metadata enrichment</li>
              <li><strong>Vercel:</strong> Application hosting and CDN</li>
            </ul>
            <p>
              Each of these services has their own privacy policies. We encourage you to review
              them for details on how they handle data.
            </p>
          </PolicySection>

          <PolicySection title="5. Cookies">
            <p>
              GifHub uses essential cookies for theme preferences (light/dark mode).
              We do not use tracking cookies, advertising cookies, or any third-party
              cookie-based analytics.
            </p>
          </PolicySection>

          <PolicySection title="6. Data Storage & Security">
            <p>
              Your data is stored securely using industry-standard practices:
            </p>
            <ul>
              <li>Database hosted on Supabase with row-level security policies</li>
              <li>All data transmitted over HTTPS/TLS encryption</li>
              <li>IP addresses are used only for like deduplication and are not linked to other data</li>
              <li>Client-side data (favorites, collections) is stored in your browser only</li>
            </ul>
          </PolicySection>

          <PolicySection title="7. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Clear your local data (favorites, collections, search history) at any time through your browser settings</li>
              <li>Request information about what data we have associated with your IP</li>
              <li>Request deletion of any data associated with your IP address</li>
            </ul>
          </PolicySection>

          <PolicySection title="8. Children's Privacy">
            <p>
              GifHub is not directed to children under 13. We do not knowingly collect
              information from children under 13 years of age.
            </p>
          </PolicySection>

          <PolicySection title="9. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. We will notify users
              of any material changes by updating the &quot;Last updated&quot; date at the top
              of this page.
            </p>
          </PolicySection>

          <PolicySection title="10. Contact Us">
            <p>
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href="/contact" className="text-primary hover:underline">our contact page</a>.
            </p>
          </PolicySection>
        </div>
      </main>
      <Footer />
    </>
  )
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
      <h2 className="mb-3 text-lg font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:hover:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
