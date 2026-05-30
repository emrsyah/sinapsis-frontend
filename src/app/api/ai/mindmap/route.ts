import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import z from 'zod'
import { MindMapContentSchema } from '@/lib/schemas/studyTool.schema'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

type MindMapOptions = {
  branchCount?: number
  focus?: string
  depth?: 'overview' | 'balanced' | 'detailed'
}

function clamp(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

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
  const { content, options }: { content: string; options?: MindMapOptions } = await req.json()

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const branchCount = clamp(options?.branchCount, 5, 2, 10)
  const focus = options?.focus?.trim()
  const depth = options?.depth ?? 'balanced'
  const subNodeRange = depth === 'overview' ? '1-2' : depth === 'detailed' ? '3-5' : '2-4'

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.5-flash-lite'),
    schema: GeneratedMindMapSchema,
    prompt: `You are a study assistant. Based on the following note content, generate a hierarchical mind map. The root should be the main topic. Include exactly ${branchCount} top-level branches for major themes, and each branch should have ${subNodeRange} sub-nodes for key details.${focus ? ` Focus especially on: ${focus}.` : ''} Keep node labels short (1-4 words).\n\nNote content:\n${plain}`,
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
