import z from "zod"

export const NoteLinkSchema = z.object({
    id: z.string().uuid(),
    source_note: z.string().uuid(),
    target_note: z.string().uuid(),
    created_at: z.string(),
})

export const StoreLinkSchema = z.object({
    target_note_id: z.string().uuid(),
})