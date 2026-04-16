import { generateWithRetry } from './gemini'

interface SubcategoryContext {
  categoryName: string
  categorySlug: string
  subcategoryName: string
  subcategorySlug: string
}

export async function generateSearchQueries(
  subcategories: SubcategoryContext[],
  queriesPerSub = 5
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>()

  const subList = subcategories
    .map((s) => `- slug: "${s.subcategorySlug}" | name: "${s.subcategoryName}" | parent: "${s.categoryName}"`)
    .join('\n')

  const prompt = `You are the GIF Search Specialist for GifHub.App — a professional workplace GIF platform.

Your job: generate ${queriesPerSub} search queries per subcategory that will return HIGH-QUALITY, BUSINESS-APPROPRIATE GIFs from Giphy and Tenor APIs.

═══ PLATFORM CONTEXT ═══
GifHub.App serves businesses worldwide. GIFs are used in:
- Slack / Microsoft Teams reactions
- Company presentations and newsletters  
- Email communication
- Social media marketing
- Team standup meetings

═══ SEARCH STRATEGY ═══
1. EMOTION-FIRST: Search for universal emotions, not specific events
   ✓ "excited celebration gif" → returns diverse, usable GIFs
   ✗ "super bowl celebration" → returns sports-specific, unusable GIFs

2. PROFESSIONAL CONTEXT: Add work/office/team modifiers
   ✓ "thank you team gif", "great job work reaction"
   ✗ "funny cat", "meme compilation"

3. REACTION-FOCUSED: Target animated reactions people actually send
   ✓ "thumbs up professional", "mind blown reaction", "slow clap office"
   ✗ "landscape beautiful", "food cooking"

4. VARIETY: Mix different emotions and scenarios per subcategory
   - Include celebrations, frustrations, excitement, relief, sarcasm, gratitude
   - Mix animated characters, office scenes, and abstract reactions

═══ SUBCATEGORIES ═══
${subList}

═══ RESPONSE FORMAT ═══
Return ONLY valid JSON — no markdown, no explanation:
{
  "${subcategories[0]?.subcategorySlug || 'example-slug'}": ["query 1", "query 2", "query 3", "query 4", "query 5"]
}

Each query: 2-5 words, natural language, optimized for Giphy/Tenor search.`

  try {
    const text = await generateWithRetry(prompt)

    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    for (const sub of subcategories) {
      const queries = parsed[sub.subcategorySlug]
      if (Array.isArray(queries)) {
        result.set(sub.subcategorySlug, queries.slice(0, queriesPerSub))
      }
    }
  } catch (err) {
    console.error('[QueryGenerator] Failed to generate queries:', err)
    for (const sub of subcategories) {
      result.set(sub.subcategorySlug, generateFallbackQueries(sub))
    }
  }

  return result
}

function generateFallbackQueries(sub: SubcategoryContext): string[] {
  const baseQueries: Record<string, string[]> = {
    'campaign-launch': ['marketing launch celebration gif', 'going viral excitement reaction', 'campaign success office', 'marketing team high five', 'launch day countdown excited'],
    'social-media-wins': ['social media celebration gif', 'viral post excited reaction', 'content going viral office', 'engagement growth happy', 'social media win team'],
    'brand-moments': ['brand recognition celebration gif', 'creative team proud moment', 'branding success reaction', 'design approved excited', 'brand launch happy'],
    'mrr-goal': ['revenue milestone celebration gif', 'hitting sales target reaction', 'growth chart excited', 'business goal achieved happy', 'quarterly target met team'],
    'churn-reactions': ['customer leaving sad gif', 'losing client reaction office', 'retention struggle work', 'please stay reaction', 'farewell wave professional'],
    'product-hunt-launch': ['product launch excitement gif', 'startup launch nervous', 'new release celebration', 'product debut countdown', 'launch day office'],
    'black-friday': ['big sale rush excited gif', 'shopping busy reaction', 'sales event celebration', 'discount season work', 'e-commerce busy day'],
    'order-shipped': ['order shipped celebration gif', 'delivery complete reaction', 'package sent happy', 'fulfillment success team', 'shipment confirmed excited'],
    'cart-abandonment': ['almost bought reaction gif', 'customer leaving sad', 'abandoned purchase reaction', 'come back please gif', 'lost sale frustrated'],
    'funding-round': ['funding received celebration gif', 'investment closed excited', 'investor meeting nervous', 'startup milestone happy', 'capital raised team'],
    'market-reactions': ['stock market reaction gif', 'financial news shocked', 'market up celebration', 'analyst thinking reaction', 'trading day excited'],
    'compliance-vibes': ['audit day nervous gif', 'compliance approved relief', 'regulation check careful', 'rules following reaction', 'legal review passed happy'],
    'new-hire-welcome': ['welcome to team gif', 'new employee first day', 'welcome aboard excited', 'onboarding celebration', 'new colleague wave'],
    'performance-review': ['got promoted celebration gif', 'performance review nervous', 'annual review reaction', 'raise received excited', 'feedback meeting office'],
    'team-building': ['teamwork celebration gif', 'team bonding moment', 'coworkers high five', 'group hug office', 'team spirit reaction'],
    'feature-shipped': ['code deployed celebration gif', 'feature released excited', 'ship it reaction developer', 'release day happy', 'deploy success team'],
    'bug-in-prod': ['production bug panic gif', 'server down shocked reaction', 'debugging frustrated developer', 'code error face palm', 'hotfix needed nervous'],
    'sprint-retro': ['sprint done celebration gif', 'retrospective meeting reaction', 'agile team review', 'development complete happy', 'velocity achieved excited'],
    'monday-morning': ['monday morning mood gif', 'start of week reaction', 'morning coffee office', 'back to work struggling', 'new week motivation'],
    'friday-vibes': ['friday feeling celebration gif', 'weekend coming excited', 'friday afternoon happy', 'end of week relief', 'leaving office friday'],
    'meeting-email': ['meeting could be email gif', 'boring meeting reaction', 'too many meetings frustrated', 'unnecessary meeting face', 'calendar overload office'],
  }

  return baseQueries[sub.subcategorySlug] || [
    `${sub.subcategoryName} professional reaction gif`,
    `${sub.subcategoryName} work celebration`,
    `${sub.subcategoryName} office moment gif`,
    `business ${sub.categoryName} reaction`,
    `professional ${sub.subcategoryName} team gif`,
  ]
}
