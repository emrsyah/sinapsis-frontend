// Zod Schema Scaffolding

import { z } from 'zod'

export const UserSchema = z.object({
    user_id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().url().nullable(),
    last_opened_note_id: z.string().uuid().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const UpdateUserSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    image: z.string().url().nullable().optional(),
})

export const UpdateLastOpenedSchema = z.object({
    note_id: z.string().uuid(),
})