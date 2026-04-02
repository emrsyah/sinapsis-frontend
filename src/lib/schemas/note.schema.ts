// Zod Schema Scaffolding

import z from "zod"
import { TagSchema } from "./tag.schema"

// 1. Explicitly define the TypeScript type to break the inference loop
// 1. Explicitly define the TypeScript type
export interface Note {
    id: string;
    user_id: string;
    folder_id: string | null;
    title: string;
    content: string | null;
    is_published: boolean;
    share_token: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    tags?: z.infer<typeof TagSchema>[]; // <-- Added [] here to make it an array!
    backlinks?: Note[];
}

// 2. Annotate the schema with z.ZodType<Note>
export const NoteSchema: z.ZodType<Note> = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    folder_id: z.string().uuid().nullable(),
    title: z.string(),
    content: z.string().nullable(),
    is_published: z.boolean(),
    share_token: z.string().nullable(),
    deleted_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    tags: z.array(TagSchema).optional(),
    backlinks: z.array(z.lazy(() => NoteSchema)).optional(),
})

// The rest of your schemas remain exactly the same
export const NoteListSchema = z.array(NoteSchema)

export const StoreNoteSchema = z.object({
    title: z.string().min(1).max(255).default('Untitled'),
    content: z.string().nullable().optional(),
    folder_id: z.string().uuid().nullable().optional(),
})

export const UpdateNoteSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().nullable().optional(),
    folder_id: z.string().uuid().nullable().optional(),
})