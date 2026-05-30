import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { FlashcardContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

export async function POST(req: Request) {
  const { content }: { content: string } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: FlashcardContentSchema,
    prompt: `You are a study assistant. Based on the following note content, generate 5–8 flashcards that cover the key concepts, definitions, and important points. Each flashcard should have a clear question and a concise answer.\n\nNote content:\n${plain}`,
  })

  return Response.json(object)
}
