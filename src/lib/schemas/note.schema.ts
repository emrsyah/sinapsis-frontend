import z from "zod"
import { TagSchema } from "./tag.schema"

export interface Note {
  id: string
  user_id: string
  folder_id: string | null
  title: string
  content: string | null
  is_published: boolean
  is_pinned: boolean
  share_token: string | null
  share_url: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  tags?: z.infer<typeof TagSchema>[]
  backlinks?: Note[]
  outgoing_links?: Note[]
}

export const NoteSchema: z.ZodType<Note> = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  folder_id: z.string().uuid().nullable(),
  title: z.string(),
  content: z.string().nullable(),
  is_published: z.boolean(),
  is_pinned: z.boolean(),
  share_token: z.string().nullable(),
  share_url: z.string().nullable(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(TagSchema).optional(),
  backlinks: z.array(z.lazy(() => NoteSchema)).optional(),
  outgoing_links: z.array(z.lazy(() => NoteSchema)).optional(),
})

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
