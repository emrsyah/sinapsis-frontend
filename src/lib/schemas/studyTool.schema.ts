// Zod Schema Scaffolding

import z from "zod"

const FlashcardSchema = z.object({
    question: z.string(),
    answer: z.string(),
})

export const FlashcardContentSchema = z.object({
    cards: z.array(FlashcardSchema).min(1),
})

const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correct_index: z.number().int().min(0).max(3),
    explanation: z.string(),
})

export const QuizContentSchema = z.object({
    questions: z.array(QuizQuestionSchema).min(1),
})

const MindMapNodeSchema: z.ZodType<{
    label: string
    children: MindMapNode[]
}> = z.lazy(() =>
    z.object({
        label: z.string(),
        children: z.array(MindMapNodeSchema),
    })
)

type MindMapNode = z.infer<typeof MindMapNodeSchema>

export const MindMapContentSchema = z.object({
    root: z.string(),
    children: z.array(MindMapNodeSchema),
    image_url: z.string().url().nullable().optional(),
})

export const StudyToolTypeSchema = z.enum(['flashcard', 'quiz', 'mindmap'])
export const StudyToolStatusSchema = z.enum(['pending', 'completed', 'failed'])

export const StudyToolContentSchema = z.discriminatedUnion('type' as never, [
    z.object({ type: z.literal('flashcard'), ...FlashcardContentSchema.shape }),
    z.object({ type: z.literal('quiz'), ...QuizContentSchema.shape }),
    z.object({ type: z.literal('mindmap'), ...MindMapContentSchema.shape }),
])

export const StudyToolSchema = z.object({
    id: z.string().uuid(),
    note_id: z.string().uuid(),
    user_id: z.string().uuid(),
    type: StudyToolTypeSchema,
    content: z.union([FlashcardContentSchema, QuizContentSchema, MindMapContentSchema]),
    image_url: z.string().url().nullable(),
    status: StudyToolStatusSchema,
    created_at: z.string(),
})

export const StudyToolListSchema = z.array(StudyToolSchema)

export const StoreStudyToolSchema = z.object({
    type: StudyToolTypeSchema,
    // Pass z.string() as the key type, and z.unknown() as the value type
    content: z.record(z.string(), z.unknown()),
    status: StudyToolStatusSchema.default('pending'),
    image_url: z.string().url().nullable().optional(),
})

export const UpdateStudyToolStatusSchema = z.object({
    status: StudyToolStatusSchema,
    // Do the same here
    content: z.record(z.string(), z.unknown()).optional(),
    image_url: z.string().url().nullable().optional(),
})