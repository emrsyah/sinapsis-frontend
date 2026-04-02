// Types Export Scaffolding

import { AttachmentSchema, StoreAttachmentSchema } from '@/lib/schemas/attachment.schema'
import { AuthResponseSchema, LoginSchema, RegisterSchema } from '@/lib/schemas/auth.schema'
import { FolderSchema, StoreFolderSchema, UpdateFolderSchema } from '@/lib/schemas/folder.schema'
import { NoteSchema, StoreNoteSchema, UpdateNoteSchema } from '@/lib/schemas/note.schema'
import { NoteLinkSchema } from '@/lib/schemas/noteLink.schema'
import { PublishResponseSchema } from '@/lib/schemas/sharing.schema'
import { FlashcardContentSchema, MindMapContentSchema, QuizContentSchema, StoreStudyToolSchema, StudyToolSchema, StudyToolStatusSchema, StudyToolTypeSchema } from '@/lib/schemas/studyTool.schema'
import { StoreTagSchema, TagSchema, UpdateTagSchema } from '@/lib/schemas/tag.schema'
import { UpdateUserSchema, UserSchema } from '@/lib/schemas/user.schema'
import type { z } from 'zod'

export type User = z.infer<typeof UserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type Register = z.infer<typeof RegisterSchema>
export type Login = z.infer<typeof LoginSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export type Folder = z.infer<typeof FolderSchema>
export type StoreFolder = z.infer<typeof StoreFolderSchema>
export type UpdateFolder = z.infer<typeof UpdateFolderSchema>

export type Tag = z.infer<typeof TagSchema>
export type StoreTag = z.infer<typeof StoreTagSchema>
export type UpdateTag = z.infer<typeof UpdateTagSchema>

export type Attachment = z.infer<typeof AttachmentSchema>
export type StoreAttachment = z.infer<typeof StoreAttachmentSchema>

export type Note = z.infer<typeof NoteSchema>
export type StoreNote = z.infer<typeof StoreNoteSchema>
export type UpdateNote = z.infer<typeof UpdateNoteSchema>

export type NoteLink = z.infer<typeof NoteLinkSchema>

export type StudyTool = z.infer<typeof StudyToolSchema>
export type StudyToolType = z.infer<typeof StudyToolTypeSchema>
export type StudyToolStatus = z.infer<typeof StudyToolStatusSchema>
export type StoreStudyTool = z.infer<typeof StoreStudyToolSchema>
export type FlashcardContent = z.infer<typeof FlashcardContentSchema>
export type QuizContent = z.infer<typeof QuizContentSchema>
export type MindMapContent = z.infer<typeof MindMapContentSchema>

export type PublishResponse = z.infer<typeof PublishResponseSchema>