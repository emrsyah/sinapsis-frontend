import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { QuizContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

type QuizOptions = {
  amount?: number
  focus?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

function clamp(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

export async function POST(req: Request) {
  const { content, options }: { content: string; options?: QuizOptions } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const amount = clamp(options?.amount, 6, 3, 20)
  const focus = options?.focus?.trim()
  const difficulty = options?.difficulty ?? 'medium'

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: QuizContentSchema,
    prompt: `You are a study assistant. Based on the following note content, generate exactly ${amount} ${difficulty} multiple choice quiz questions that test understanding of the key concepts.${focus ? ` Focus especially on: ${focus}.` : ''} Each question must have exactly 4 options (as an array of strings) and a correct_index (0-3) indicating which option is correct. Also include a brief explanation for why the correct answer is right.\n\nNote content:\n${plain}`,
  })

  return Response.json(object)
}
