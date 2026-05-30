import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    content,
    messages,
  }: {
    content: string
    messages: ChatMessage[]
  } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const transcript = messages
    .map((message) => `${message.role === 'user' ? 'Student' : 'Assistant'}: ${message.content}`)
    .join('\n')

  const result = streamText({
    model: openrouter('google/gemini-2.5-flash-lite'),
    system:
      'You are a concise study assistant. Answer using the provided note context. If the note does not contain enough information, say what is missing and avoid inventing facts.',
    prompt: `Note context:\n${plain || '(The note is empty.)'}\n\nConversation:\n${transcript}`,
  })

  return result.toTextStreamResponse()
}
