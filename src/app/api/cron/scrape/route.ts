import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateSearchQueries } from '@/lib/ai/query-generator'
import { validateAndEnrichGifs, type ValidationInput } from '@/lib/ai/validator'
import { ingestGifs } from '@/lib/ai/ingest'
import { scrapeGifs } from '@/lib/scraper'

const MAX_SUBCATEGORIES_PER_RUN = 3
const MAX_QUERIES_PER_SUB = 4
const MAX_GIFS_PER_QUERY = 8
const BATCH_SIZE = 10
const PIPELINE_TIMEOUT_MS = 8 * 60 * 1000

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log: string[] = []
  const addLog = (msg: string) => {
    console.log(`[CronScrape] ${msg}`)
    log.push(msg)
  }

  const pipelineStart = Date.now()
  const elapsed = () => `${((Date.now() - pipelineStart) / 1000).toFixed(1)}s`
  const isTimedOut = () => Date.now() - pipelineStart > PIPELINE_TIMEOUT_MS

  try {
    addLog('Starting pipeline...')

    const hasGiphy = !!process.env.GIPHY_API_KEY
    const hasTenor = !!process.env.TENOR_API_KEY
    const hasGemini = !!process.env.GEMINI_API_KEY

    addLog(`Config: Giphy=${hasGiphy ? 'OK' : 'MISSING'}, Tenor=${hasTenor ? 'OK' : 'MISSING'}, Gemini=${hasGemini ? 'OK' : 'MISSING'}`)

    if (!hasGiphy && !hasTenor) {
      addLog('ABORT: No GIF API keys. Add GIPHY_API_KEY and/or TENOR_API_KEY to .env.local')
      return NextResponse.json({
        success: false,
        error: 'No GIF API keys configured. Add GIPHY_API_KEY and/or TENOR_API_KEY.',
        log,
      })
    }

    const categoryIds = request.nextUrl.searchParams.get('categories')
    const selectedCategoryIds = categoryIds ? categoryIds.split(',').filter(Boolean) : []

    // Step 1: Load all categories and subcategories from DB
    const { data: dbCategories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
    const { data: dbSubcategories } = await supabaseAdmin
      .from('subcategories')
      .select('id, name, slug, category_id, categories(name, slug)')

    if (!dbSubcategories?.length || !dbCategories?.length) {
      addLog('ABORT: No categories/subcategories in database. Run the SQL schema first.')
      return NextResponse.json({ success: false, error: 'No categories in database', log })
    }

    const catSlugs = dbCategories.map((c) => c.slug)
    const subSlugs = dbSubcategories.map((s) => s.slug)

    addLog(`DB: ${dbCategories.length} categories, ${dbSubcategories.length} subcategories`)

    // Step 2: Pick subcategories — filter by selected categories if provided
    let pool = [...dbSubcategories]
    if (selectedCategoryIds.length > 0) {
      pool = pool.filter((s: any) => selectedCategoryIds.includes(s.category_id))
      const catNames = dbCategories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name)
      addLog(`Filtered to categories: ${catNames.join(', ')} (${pool.length} subcategories)`)
    }

    const shuffled = pool.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, MAX_SUBCATEGORIES_PER_RUN)

    const subContexts = selected.map((s: any) => ({
      categoryName: s.categories?.name ?? '',
      categorySlug: s.categories?.slug ?? '',
      subcategoryName: s.name,
      subcategorySlug: s.slug,
    }))

    addLog(`Selected: ${subContexts.map((s) => `${s.categorySlug}/${s.subcategorySlug}`).join(', ')}`)

    // Step 3: Generate search queries via Gemini
    const queriesMap = await generateSearchQueries(subContexts, MAX_QUERIES_PER_SUB)

    // Build query→context lookup (query string → category/subcategory)
    const queryToContext = new Map<string, { catSlug: string; subSlug: string }>()
    const allQueryStrings: string[] = []

    for (const sub of subContexts) {
      const queries = queriesMap.get(sub.subcategorySlug) ?? []
      for (const q of queries) {
        queryToContext.set(q, { catSlug: sub.categorySlug, subSlug: sub.subcategorySlug })
        allQueryStrings.push(q)
      }
    }

    addLog(`Generated ${allQueryStrings.length} queries [${elapsed()}]`)

    if (allQueryStrings.length === 0) {
      addLog('ABORT: No queries generated')
      return NextResponse.json({ success: false, error: 'Query generation failed', log })
    }

    if (isTimedOut()) {
      addLog('Timed out after query generation')
      return NextResponse.json({ success: true, log, stats: { scraped: 0, validated: 0, inserted: 0 } })
    }

    // Step 4: Fetch GIFs via APIs
    const platforms: ('giphy' | 'tenor')[] = []
    if (hasGiphy) platforms.push('giphy')
    if (hasTenor) platforms.push('tenor')

    const scrapeResult = await scrapeGifs({
      queries: allQueryStrings,
      maxPerQuery: MAX_GIFS_PER_QUERY,
      platforms,
    })

    addLog(`Fetched ${scrapeResult.totalScraped} GIFs (${scrapeResult.gifs.length} unique, ${scrapeResult.deduplicatedCount} dupes) [${elapsed()}]`)

    if (scrapeResult.errors.length > 0) {
      addLog(`Fetch warnings: ${scrapeResult.errors.slice(0, 3).join('; ')}`)
    }

    if (scrapeResult.gifs.length === 0) {
      addLog('ABORT: No GIFs fetched from APIs')
      return NextResponse.json({ success: true, log, stats: { scraped: 0, validated: 0, inserted: 0 } })
    }

    if (isTimedOut()) {
      addLog('Timed out after fetching')
      return NextResponse.json({ success: true, log, stats: { scraped: scrapeResult.totalScraped, validated: 0, inserted: 0 } })
    }

    // Step 5: Validate & enrich via Gemini (in batches)
    // Each GIF carries its searchQuery, so we can look up the exact category context
    const validatedPairs: Array<{
      scraped: typeof scrapeResult.gifs[0]
      validated: NonNullable<Awaited<ReturnType<typeof validateAndEnrichGifs>>[0]>
    }> = []

    for (let i = 0; i < scrapeResult.gifs.length; i += BATCH_SIZE) {
      if (isTimedOut()) {
        addLog(`Validation timed out at batch ${Math.floor(i / BATCH_SIZE) + 1}`)
        break
      }

      const batch = scrapeResult.gifs.slice(i, i + BATCH_SIZE)

      const inputs: ValidationInput[] = batch.map((gif) => {
        const ctx = queryToContext.get(gif.searchQuery) ?? { catSlug: catSlugs[0], subSlug: subSlugs[0] }
        return {
          gif,
          targetCategorySlug: ctx.catSlug,
          targetSubcategorySlug: ctx.subSlug,
          availableCategorySlugs: catSlugs,
          availableSubcategorySlugs: subSlugs,
        }
      })

      const results = await validateAndEnrichGifs(inputs)

      for (let j = 0; j < batch.length; j++) {
        const validated = results[j]
        if (!validated || !validated.isRelevant) continue

        // Ensure the returned slugs actually exist in our DB
        if (!catSlugs.includes(validated.categorySlug)) {
          const ctx = queryToContext.get(batch[j].searchQuery)
          validated.categorySlug = ctx?.catSlug ?? catSlugs[0]
        }
        if (!subSlugs.includes(validated.subcategorySlug)) {
          const ctx = queryToContext.get(batch[j].searchQuery)
          validated.subcategorySlug = ctx?.subSlug ?? subSlugs[0]
        }

        validatedPairs.push({ scraped: batch[j], validated })
      }

      addLog(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} checked → ${validatedPairs.length} accepted [${elapsed()}]`)
    }

    addLog(`Validation done: ${validatedPairs.length}/${scrapeResult.gifs.length} passed [${elapsed()}]`)

    if (validatedPairs.length === 0) {
      addLog('No GIFs passed validation')
      return NextResponse.json({
        success: true, log,
        stats: { scraped: scrapeResult.totalScraped, validated: 0, inserted: 0 },
      })
    }

    // Step 6: Ingest into Supabase (download → Storage → DB) in batches
    addLog(`Starting ingestion of ${validatedPairs.length} GIFs...`)

    const INGEST_BATCH = 10
    let totalInserted = 0
    let totalSkipped = 0
    const allIngestErrors: string[] = []

    for (let i = 0; i < validatedPairs.length; i += INGEST_BATCH) {
      if (isTimedOut()) {
        addLog(`Ingestion timed out at batch ${Math.floor(i / INGEST_BATCH) + 1}, ingested ${totalInserted} so far`)
        break
      }
      const batch = validatedPairs.slice(i, i + INGEST_BATCH)
      const ingestBatchResult = await ingestGifs(batch)
      totalInserted += ingestBatchResult.inserted
      totalSkipped += ingestBatchResult.skipped
      allIngestErrors.push(...ingestBatchResult.errors)
      addLog(`Ingest batch ${Math.floor(i / INGEST_BATCH) + 1}: +${ingestBatchResult.inserted} new, ${ingestBatchResult.skipped} dupes [${elapsed()}]`)
    }

    addLog(`Ingestion complete: ${totalInserted} new, ${totalSkipped} dupes [${elapsed()}]`)

    if (allIngestErrors.length > 0) {
      addLog(`Ingest errors: ${allIngestErrors.slice(0, 3).join('; ')}`)
    }

    const stats = {
      subcategoriesProcessed: selected.length,
      queriesGenerated: allQueryStrings.length,
      scraped: scrapeResult.totalScraped,
      deduplicated: scrapeResult.deduplicatedCount,
      validated: validatedPairs.length,
      inserted: totalInserted,
      skipped: totalSkipped,
    }

    addLog(`Done [${elapsed()}]`)

    return NextResponse.json({ success: true, stats, log })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    addLog(`FATAL [${elapsed()}]: ${msg}`)
    return NextResponse.json({ success: false, error: msg, log }, { status: 500 })
  }
}
