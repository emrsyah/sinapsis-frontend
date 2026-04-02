// Zod Schema Scaffolding

import z from "zod"

export const TagSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(), // hex color
    created_at: z.string(),
})

export const TagListSchema = z.array(TagSchema)

export const StoreTagSchema = z.object({
    name: z.string().min(1, 'Tag name is required').max(100),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
        .optional(),
})

export const UpdateTagSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
        .nullable()
        .optional(),
})

export const AttachTagSchema = z.object({
    tag_id: z.string().uuid(),
})