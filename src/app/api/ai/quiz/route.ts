import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { QuizContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

export async function POST(req: Request) {
  const { content }: { content: string } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: QuizContentSchema,
    prompt: `You are a study assistant. Based on the following note content, generate 5–8 multiple choice quiz questions that test understanding of the key concepts. Each question must have exactly 4 options (as an array of strings) and a correct_index (0-3) indicating which option is correct. Also include a brief explanation for why the correct answer is right.\n\nNote content:\n${plain}`,
  })

  return Response.json(object)
}
