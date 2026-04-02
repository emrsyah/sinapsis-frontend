// Zod Schema Scaffolding

import z from "zod"

export const AttachmentSchema = z.object({
    id: z.string().uuid(),
    note_id: z.string().uuid(),
    user_id: z.string().uuid(),
    file_url: z.string().url(),
    file_name: z.string(),
    file_type: z.string().nullable(),
    file_size: z.number().int().nullable(), // bytes
    created_at: z.string(),
})

export const AttachmentListSchema = z.array(AttachmentSchema)

export const StoreAttachmentSchema = z.object({
    file_url: z.string().url('Must be a valid URL'),
    file_name: z.string().min(1),
    file_type: z.string().optional(),
    file_size: z.number().int().positive().optional(),
})