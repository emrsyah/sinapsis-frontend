import z from "zod"

// Zod Schema Scaffolding

export const FolderSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    parent_id: z.string().uuid().nullable(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const FolderListSchema = z.array(FolderSchema)

export const StoreFolderSchema = z.object({
    name: z.string().min(1, 'Folder name is required').max(255),
    parent_id: z.string().uuid().nullable().optional(),
})

export const UpdateFolderSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    parent_id: z.string().uuid().nullable().optional(),
})