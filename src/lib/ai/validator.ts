import { generateWithRetry } from './gemini'
import type { ScrapedGif } from '../scraper/types'

export interface ValidatedGif {
  isRelevant: boolean
  seoTitle: string
  seoAltText: string
  seoDescription: string
  categorySlug: string
  subcategorySlug: string
  tags: string[]
}

export interface ValidationInput {
  gif: ScrapedGif
  targetCategorySlug: string
  targetSubcategorySlug: string
  availableCategorySlugs: string[]
  availableSubcategorySlugs: string[]
}

const CATEGORY_CONTEXT: Record<string, string> = {
  'marketing': 'marketing campaigns, branding, social media, content strategy, advertising',
  'saas': 'SaaS products, MRR, subscriptions, product launches, startup metrics',
  'ecommerce': 'online shopping, orders, shipping, sales events, customer experience',
  'fintech': 'finance, banking, investments, funding rounds, market trends, compliance',
  'human-resources': 'hiring, onboarding, HR, team management, performance reviews, culture',
  'product-engineering': 'software development, coding, deployments, bugs, sprints, engineering',
  'team-communication': 'Slack, meetings, remote work, office life, standup, collaboration',
}

export async function validateAndEnrichGifs(
  inputs: ValidationInput[]
): Promise<(ValidatedGif | null)[]> {
  if (inputs.length === 0) return []

  const gifsForPrompt = inputs.map((input, i) => ({
    index: i,
    originalTitle: input.gif.sourceTitle,
    originalAlt: input.gif.altText,
    searchQuery: input.gif.searchQuery,
    platform: input.gif.sourcePlatform,
    targetCategory: input.targetCategorySlug,
    targetSubcategory: input.targetSubcategorySlug,
    categoryKeywords: CATEGORY_CONTEXT[input.targetCategorySlug] || '',
  }))

  const allCategorySlugs = [...new Set(inputs.flatMap((i) => i.availableCategorySlugs))]
  const allSubcategorySlugs = [...new Set(inputs.flatMap((i) => i.availableSubcategorySlugs))]

  const prompt = `You are the SEO Director for GifHub.App — a professional GIF platform for businesses.

Your mission: transform raw GIF data into perfectly SEO-optimized content that ranks on Google, drives organic traffic, and converts searchers into users.

═══ CONTENT QUALITY GATE ═══

ACCEPT only GIFs that are:
✓ Professional & workplace-safe (any corporate environment globally)
✓ Internationally understood (no culture/country-specific references)
✓ Clear emotion or reaction (celebration, frustration, excitement, humor, etc.)
✓ Business-relevant (usable in Slack, Teams, email, presentations)

REJECT immediately:
✗ Political, religious, violent, NSFW, or controversial
✗ Region-specific (American sports, country-specific holidays, etc.)
✗ No clear emotion or reaction
✗ Low quality or irrelevant to business

═══ SEO OPTIMIZATION RULES ═══

For each ACCEPTED GIF, generate:

1. **seoTitle** (50-65 characters):
   - Pattern: "[Emotion/Action] [Context] GIF for [Use Case]"
   - MUST contain the word "GIF"
   - Include ONE primary keyword from the target category
   - Make it click-worthy — like a headline people want to click in search results
   - Examples:
     • "Team Celebration GIF When the Sprint Ships Early"
     • "Monday Morning Mood GIF for Your Slack Channel"
     • "Deal Closed Victory Dance GIF for Sales Teams"
     • "Bug in Production Panic GIF for Developers"
   - BAD: "Happy Mr Bean GIF" (not business-specific)
   - BAD: "Celebration" (too generic, no GIF keyword)

2. **seoAltText** (100-160 characters):
   - Descriptive sentence for visually impaired users AND Google image search
   - Describe WHAT is visually happening + WHO would use it
   - Include the category context naturally
   - Example: "Animated person jumping with excitement, perfect reaction GIF for marketing teams celebrating a successful campaign launch"

3. **seoDescription** (120-160 characters):
   - Meta description for the GIF page — optimized for Google SERP CTR
   - Include a call-to-action element like "Download free", "Share with your team", "Use in Slack"
   - Example: "Download this celebration GIF for free. Perfect for Slack reactions when your team ships a new feature on time."

4. **categorySlug** + **subcategorySlug**: Pick the BEST match from available options.

5. **tags** (exactly 8 tags):
   - Mix of: 2 head terms + 3 long-tail phrases + 3 contextual keywords
   - Head terms: "celebration gif", "work reaction"
   - Long-tail: "team meeting reaction", "friday mood office"
   - Contextual: "slack gif", "professional", "workplace humor"
   - ALL lowercase, 1-3 words each

═══ GIFs TO PROCESS ═══

${JSON.stringify(gifsForPrompt, null, 2)}

Available categories: ${JSON.stringify(allCategorySlugs)}
Available subcategories: ${JSON.stringify(allSubcategorySlugs)}

═══ RESPONSE FORMAT ═══

Return ONLY valid JSON array — no markdown, no explanation:
[
  {
    "index": 0,
    "isRelevant": true,
    "seoTitle": "Team Win Celebration GIF for Project Milestones",
    "seoAltText": "Animated team members jumping and high-fiving in celebration, ideal reaction GIF for product teams hitting a major milestone",
    "seoDescription": "Download this free celebration GIF for your team. Perfect Slack reaction when your project ships successfully.",
    "categorySlug": "product-engineering",
    "subcategorySlug": "feature-shipped",
    "tags": ["celebration gif", "team win", "project milestone reaction", "office celebration", "slack gif", "professional", "high five", "success"]
  }
]

For REJECTED GIFs: { "index": N, "isRelevant": false, "seoTitle": "", "seoAltText": "", "seoDescription": "", "categorySlug": "", "subcategorySlug": "", "tags": [] }`

  try {
    const text = await generateWithRetry(prompt)

    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed: Array<{
      index: number
      isRelevant: boolean
      seoTitle: string
      seoAltText: string
      seoDescription: string
      categorySlug: string
      subcategorySlug: string
      tags: string[]
    }> = JSON.parse(cleaned)

    const results: (ValidatedGif | null)[] = new Array(inputs.length).fill(null)

    for (const item of parsed) {
      if (item.index < 0 || item.index >= inputs.length) continue

      if (!item.isRelevant) {
        results[item.index] = null
        continue
      }

      const title = item.seoTitle || inputs[item.index].gif.altText
      const titleWithGif = title.toLowerCase().includes('gif') ? title : `${title} GIF`

      results[item.index] = {
        isRelevant: true,
        seoTitle: titleWithGif,
        seoAltText: item.seoAltText || inputs[item.index].gif.altText,
        seoDescription: item.seoDescription || item.seoAltText || '',
        categorySlug: item.categorySlug || inputs[item.index].targetCategorySlug,
        subcategorySlug: item.subcategorySlug || inputs[item.index].targetSubcategorySlug,
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : [],
      }
    }

    return results
  } catch (err) {
    console.error('[Validator] Gemini validation failed after all retries:', err)
    // Reject all GIFs when AI is unavailable — we don't insert unvalidated content
    return inputs.map(() => null)
  }
}
