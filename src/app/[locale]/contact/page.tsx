import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mail, MessageCircle, HelpCircle, Clock } from 'lucide-react'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us — GifHub',
  description: 'Get in touch with the GifHub team. We\'d love to hear your feedback, suggestions, or questions.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Have a question, suggestion, or feedback? We&apos;d love to hear from you.
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Contact Form */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30 sm:p-8">
            <h2 className="text-lg font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
              <h3 className="text-sm font-semibold">Quick Info</h3>
              <div className="mt-4 space-y-4">
                <InfoRow icon={<MessageCircle size={16} />} title="General Inquiries" value="Use the contact form" />
                <InfoRow icon={<Clock size={16} />} title="Response Time" value="Within 24–48 hours" />
                <InfoRow icon={<HelpCircle size={16} />} title="Support" value="support@gifhub.app" />
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 dark:bg-card/30">
              <h3 className="text-sm font-semibold">Frequently Asked Questions</h3>
              <div className="mt-4 space-y-4">
                <FaqItem
                  question="Is GifHub free to use?"
                  answer="Yes, GifHub is completely free. You can browse, search, download, and share GIFs at no cost."
                />
                <FaqItem
                  question="Can I use GIFs for commercial purposes?"
                  answer="GIFs can be used for internal business communication. For commercial use in ads or products, check the original source licensing."
                />
                <FaqItem
                  question="How do I report inappropriate content?"
                  answer="Use the contact form to report any GIF that doesn't meet our professional standards. Include the GIF URL if possible."
                />
                <FaqItem
                  question="Can I request specific GIFs?"
                  answer="Absolutely! Send us a message with the type of GIFs you're looking for, and we'll work to add them to our library."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function InfoRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{question}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  )
}
