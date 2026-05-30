import z from "zod"

export type FolderSchema = z.infer<typeof FolderSchema>
export const FolderSchema: z.ZodType<{
  id: string
  user_id: string
  parent_id: string | null
  name: string
  created_at: string
  updated_at: string
  children: FolderSchema[]
}> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    parent_id: z.string().uuid().nullable(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    children: z.array(FolderSchema),
  })
)

export const StoreFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255),
  parent_id: z.string().uuid().nullable().optional(),
})

export const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parent_id: z.string().uuid().nullable().optional(),
})
