import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_CHAIN = ['gemini-2.5-flash-lite', 'gemini-2.0-flash']
const MAX_RETRIES = 2
const BASE_DELAY_MS = 1500

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    genAI = new GoogleGenerativeAI(key)
  }
  return genAI
}

export function getModel(modelName = MODEL_CHAIN[0]) {
  return getGenAI().getGenerativeModel({ model: modelName })
}

export async function generateWithRetry(prompt: string): Promise<string> {
  let lastError: Error | null = null

  for (const modelName of MODEL_CHAIN) {
    const model = getGenAI().getGenerativeModel({ model: modelName })

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await model.generateContent(prompt)
        return response.response.text()
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err))

        const status = err?.status || err?.response?.status || 0
        const isRetryable = status === 503 || status === 429 || status === 500

        if (!isRetryable) throw lastError

        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000
        console.warn(`[Gemini] ${modelName} returned ${status}, retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay)}ms`)
        await new Promise((r) => setTimeout(r, delay))
      }
    }

    console.warn(`[Gemini] ${modelName} exhausted retries, trying next model...`)
  }

  throw lastError || new Error('All Gemini models failed')
}
