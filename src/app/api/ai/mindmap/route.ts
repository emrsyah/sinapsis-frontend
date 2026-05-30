import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import z from 'zod'
import { MindMapContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

const GeneratedMindMapSchema = z.object({
  root: z.string(),
  children: z.array(
    z.object({
      label: z.string(),
      children: z.array(
        z.object({
          label: z.string(),
        })
      ),
    })
  ),
})

export async function POST(req: Request) {
  const { content }: { content: string } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: GeneratedMindMapSchema,
    prompt: `You are a study assistant. Based on the following note content, generate a hierarchical mind map. The root should be the main topic. Include 3-6 top-level branches for major themes, and each branch should have 2-4 sub-nodes for key details. Keep node labels short (1-4 words).\n\nNote content:\n${plain}`,
  })

  const mindMap = MindMapContentSchema.parse({
    root: object.root,
    children: object.children.map((branch) => ({
      label: branch.label,
      children: branch.children.map((child) => ({
        label: child.label,
        children: [],
      })),
    })),
  })

  return Response.json(mindMap)
}
