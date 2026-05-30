import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { FlashcardContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

type FlashcardOptions = {
  amount?: number
  focus?: string
  answerStyle?: 'concise' | 'detailed'
}

function clamp(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

export async function POST(req: Request) {
  const { content, options }: { content: string; options?: FlashcardOptions } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const amount = clamp(options?.amount, 6, 3, 20)
  const focus = options?.focus?.trim()
  const answerStyle = options?.answerStyle === 'detailed' ? 'detailed but still study-friendly' : 'concise'

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: FlashcardContentSchema,
    prompt: `You are a study assistant. Based on the following note content, generate exactly ${amount} flashcards that cover the key concepts, definitions, and important points.${focus ? ` Focus especially on: ${focus}.` : ''} Each flashcard should have a clear question and a ${answerStyle} answer.\n\nNote content:\n${plain}`,
  })

  return Response.json(object)
}
