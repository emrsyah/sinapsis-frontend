# sinapsis-web — Frontend Reference
> Next.js 16.2 · TypeScript · Tailwind CSS · Tiptap · Zustand · Zod · Vercel AI SDK

---

## Table of Contents
1. [Stack & Libraries](#1-stack--libraries)
2. [Folder Structure](#2-folder-structure)
3. [Architecture & Patterns](#3-architecture--patterns)
4. [Routing & Pages](#4-routing--pages)
5. [State Management (Zustand)](#5-state-management-zustand)
6. [Data Fetching & Server Actions](#6-data-fetching--server-actions)
7. [Type System (Zod)](#7-type-system-zod)
8. [Editor (Tiptap)](#8-editor-tiptap)
9. [AI Pipeline](#9-ai-pipeline)
10. [Real-time Client (Reverb)](#10-real-time-client-reverb)
11. [File Uploads (Uploadthing)](#11-file-uploads-uploadthing)
12. [Environment Configuration](#12-environment-configuration)
13. [Coding Conventions](#13-coding-conventions)

---

## 1. Stack & Libraries

| Package | Version | Purpose |
|---|---|---|
| `next` | ^16.2 | Framework (App Router, Server Actions, Turbopack) |
| `typescript` | ^5.0 | Language |
| `tailwindcss` | ^4.0 | Styling |
| `zod` | ^3.0 | Schema validation + type inference |
| `zustand` | ^5.0 | Client-side UI state management |
| `ai` (Vercel AI SDK) | ^4.0 | LLM calls in Server Actions |
| `@tiptap/react` | ^2.0 | Rich text editor |
| `@tiptap/starter-kit` | ^2.0 | Tiptap base extensions |
| `@tiptap/extension-placeholder` | ^2.0 | Editor placeholder |
| `laravel-echo` | ^1.0 | Reverb WebSocket client |
| `pusher-js` | ^8.0 | Required peer dep for Laravel Echo |
| `uploadthing` | ^7.0 | File upload SDK |
| `@uploadthing/react` | ^7.0 | Uploadthing React components |

---

## 2. Folder Structure

```
sinapsis-web/
├── app/
│   ├── (auth)/                        # unauthenticated route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (app)/                         # authenticated route group
│   │   ├── layout.tsx                 # 3-col shell: FolderPanel + NoteList + Editor
│   │   ├── page.tsx                   # redirect logic (last opened / first / create new)
│   │   ├── notes/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # note editor page
│   │   ├── trash/
│   │   │   └── page.tsx
│   │   └── study/
│   │       └── [id]/
│   │           └── page.tsx           # full-screen expanded study view
│   ├── shared/
│   │   └── [token]/
│   │       └── page.tsx               # public read-only note (no auth)
│   └── layout.tsx                     # root layout (fonts, providers)
│
├── components/
│   ├── editor/
│   │   ├── Editor.tsx                 # Tiptap editor root component
│   │   ├── EditorToolbar.tsx          # formatting toolbar
│   │   ├── BacklinksPanel.tsx         # shows notes that link to current note
│   │   ├── extensions/
│   │   │   └── NoteLink.ts            # custom [[note]] Tiptap extension
│   │   └── hooks/
│   │       ├── useAutoSave.ts         # debounced save to Laravel
│   │       └── useRealtimeSync.ts     # subscribe to note.updated Reverb event
│   ├── sidebar/
│   │   ├── Sidebar.tsx                # left sidebar wrapper
│   │   ├── FolderTree.tsx             # recursive folder tree
│   │   ├── TagList.tsx                # tags filter list
│   │   └── SearchBar.tsx              # title search input
│   ├── note/
│   │   ├── NoteList.tsx               # notes in selected folder/tag
│   │   ├── NoteCard.tsx               # single note list item
│   │   └── NoteHeader.tsx             # title, tags, share, generate button
│   ├── study/
│   │   ├── StudyPanel.tsx             # sliding panel (closed/open/expanded)
│   │   ├── StudyPanelTabs.tsx         # Flashcards / Quiz / Mind Map tabs
│   │   ├── GenerateButton.tsx         # triggers AI generation
│   │   ├── GenerationHistory.tsx      # list of past generations with timestamps
│   │   ├── FlashcardViewer.tsx        # flip-card review UI
│   │   ├── QuizViewer.tsx             # MCQ quiz with score summary
│   │   └── MindMapViewer.tsx          # image viewer + export
│   └── ui/                            # generic primitives only
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── Spinner.tsx
│
├── actions/                           # Next.js Server Actions (all mutations)
│   ├── auth.ts                        # register, login, logout, updateProfile
│   ├── notes.ts                       # note CRUD, trash, restore, lastOpened
│   ├── folders.ts                     # folder CRUD
│   ├── tags.ts                        # tag CRUD + attach/detach
│   ├── links.ts                       # note link create/delete
│   ├── attachments.ts                 # attachment save/delete
│   ├── studyTools.ts                  # get generations, update status
│   ├── sharing.ts                     # publish/unpublish
│   └── ai.ts                          # AI generation pipeline (LLM + save)
│
├── stores/                            # Zustand stores (client UI state ONLY)
│   ├── studyPanelStore.ts             # panel open/closed/expanded + active generation
│   ├── noteStore.ts                   # active note id, optimistic title update
│   └── uiStore.ts                     # sidebar collapsed state, mobile nav
│
├── lib/
│   ├── api.ts                         # base fetch wrapper (base URL + auth headers)
│   ├── echo.ts                        # Laravel Echo + Reverb client (singleton)
│   ├── uploadthing.ts                 # Uploadthing client config
│   ├── auth.ts                        # server-side: getSession, getAuthUser helpers
│   └── schemas/                       # Zod schemas — single source of truth for types
│       ├── user.schema.ts
│       ├── note.schema.ts
│       ├── folder.schema.ts
│       ├── tag.schema.ts
│       ├── attachment.schema.ts
│       └── studyTool.schema.ts
│
├── types/
│   └── index.ts                       # re-exports z.infer<> from all schemas
│
├── middleware.ts                       # auth route protection
└── .env.local
```

---

## 3. Architecture & Patterns

### Server Components vs Client Components
- Pages and layouts are **Server Components** by default — they fetch data and pass it as props
- Mark `'use client'` only when the component needs interactivity (onClick, useState, useEffect, Zustand)
- Never fetch data inside Client Components — pass it down as props from Server Components

```
Server Component (page.tsx)
  → fetches notes from Laravel
  → renders NoteList (server)
      → renders NoteCard (server)
  → renders Editor wrapper (server)
      → renders Editor (client — needs Tiptap interactivity)
```

### Server Actions for all mutations
All create/update/delete operations are Server Actions in `actions/`. Never use API Routes (`app/api/`) for data mutations.

```ts
// actions/notes.ts
'use server'

import { api } from '@/lib/api'
import { NoteSchema } from '@/lib/schemas/note.schema'

export async function updateNote(id: string, data: { title?: string; content?: string }) {
  const res = await api.patch(`/notes/${id}`, data)
  return NoteSchema.parse(res)
}
```

### Data flow
```
User interaction
  → Client Component calls Server Action
  → Server Action calls lib/api.ts (Laravel API)
  → Response validated against Zod schema
  → Return typed data to component
  → Component updates UI
```

For real-time updates:
```
Laravel broadcasts event via Reverb
  → Laravel Echo client receives event
  → Updates Zustand store or triggers re-fetch
  → React re-renders affected components
```

---

## 4. Routing & Pages

### Route groups
- `(auth)` — unauthenticated pages, no layout wrapping
- `(app)` — authenticated pages, wrapped in the 3-column app shell

### middleware.ts
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sinapsis_token')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/register')
  const isPublicRoute = request.nextUrl.pathname.startsWith('/shared')

  if (!token && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### app/(app)/page.tsx — first-load redirect logic
```ts
// Server Component — runs on server, no 'use client'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { getNotes, createNote } from '@/actions/notes'

export default async function AppHome() {
  const user = await getAuthUser()

  // 1. Redirect to last opened note
  if (user.last_opened_note_id) {
    redirect(`/notes/${user.last_opened_note_id}`)
  }

  // 2. Redirect to first available note
  const notes = await getNotes()
  if (notes.length > 0) {
    redirect(`/notes/${notes[0].id}`)
  }

  // 3. No notes at all — create one and redirect
  const newNote = await createNote({ title: 'Untitled' })
  redirect(`/notes/${newNote.id}`)
}
```

### app/(app)/layout.tsx — 3-column shell
```tsx
'use client' // needs Zustand for panel state

import { useSidebarStore } from '@/stores/uiStore'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { NoteList } from '@/components/note/NoteList'
import { StudyPanel } from '@/components/study/StudyPanel'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { studyPanelState } = useStudyPanelStore()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Col 1: Folder tree */}
      <Sidebar />

      {/* Col 2: Note list — hidden when study panel is expanded */}
      {studyPanelState !== 'expanded' && <NoteList />}

      {/* Col 3: Editor (children) */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Col 4: Study panel — slides in from right */}
      <StudyPanel />
    </div>
  )
}
```

---

## 5. State Management (Zustand)

Zustand stores hold **client UI state only**. Server data (fetched notes, folders, etc.) stays in Server Components and is passed as props — never duplicated in a store.

### studyPanelStore.ts
```ts
import { create } from 'zustand'

type StudyPanelState = 'closed' | 'open' | 'expanded'

interface StudyPanelStore {
  state: StudyPanelState
  activeGenerationId: string | null
  activeType: 'flashcard' | 'quiz' | 'mindmap' | null
  open: (generationId: string, type: StudyPanelStore['activeType']) => void
  expand: () => void
  collapse: () => void
  close: () => void
}

export const useStudyPanelStore = create<StudyPanelStore>((set) => ({
  state: 'closed',
  activeGenerationId: null,
  activeType: null,
  open: (generationId, type) => set({ state: 'open', activeGenerationId: generationId, activeType: type }),
  expand: () => set({ state: 'expanded' }),
  collapse: () => set({ state: 'open' }),
  close: () => set({ state: 'closed', activeGenerationId: null, activeType: null }),
}))
```

### noteStore.ts
```ts
import { create } from 'zustand'

interface NoteStore {
  activeNoteId: string | null
  optimisticTitle: string | null
  setActiveNote: (id: string) => void
  setOptimisticTitle: (title: string) => void
  clearOptimisticTitle: () => void
}

export const useNoteStore = create<NoteStore>((set) => ({
  activeNoteId: null,
  optimisticTitle: null,
  setActiveNote: (id) => set({ activeNoteId: id, optimisticTitle: null }),
  setOptimisticTitle: (title) => set({ optimisticTitle: title }),
  clearOptimisticTitle: () => set({ optimisticTitle: null }),
}))
```

### uiStore.ts
```ts
import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
```

---

## 6. Data Fetching & Server Actions

### lib/api.ts — base fetch wrapper
```ts
import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const cookieStore = cookies()
  const token = cookieStore.get('sinapsis_token')?.value

  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? `API error: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get:    <T>(path: string) => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
```

### Example Server Action
```ts
// actions/notes.ts
'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'
import { NoteSchema, type Note } from '@/types'

export async function updateNote(id: string, data: Partial<Pick<Note, 'title' | 'content' | 'folder_id'>>) {
  const raw = await api.patch(`/notes/${id}`, data)
  const note = NoteSchema.parse(raw)
  revalidatePath(`/notes/${id}`)
  return note
}

export async function updateLastOpenedNote(noteId: string) {
  // fire and forget — don't block the UI
  api.patch('/auth/me/last-opened', { note_id: noteId }).catch(() => {})
}

export async function createNote(data: { title?: string; folder_id?: string }) {
  const raw = await api.post('/notes', { title: 'Untitled', ...data })
  const note = NoteSchema.parse(raw)
  revalidatePath('/')
  return note
}
```

---

## 7. Type System (Zod)

Zod schemas are the **single source of truth** for all types. `types/index.ts` re-exports `z.infer<>` from each schema — no manually written TypeScript interfaces for API shapes.

### lib/schemas/note.schema.ts
```ts
import { z } from 'zod'
import { TagSchema } from './tag.schema'

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable(),
  is_published: z.boolean(),
  share_token: z.string().nullable(),
  folder_id: z.string().uuid().nullable(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(TagSchema).optional(),
  backlinks: z.array(z.lazy(() => NoteSchema)).optional(),
})

export const NoteListSchema = z.array(NoteSchema)
```

### lib/schemas/studyTool.schema.ts
```ts
import { z } from 'zod'

const FlashcardContentSchema = z.object({
  cards: z.array(z.object({ question: z.string(), answer: z.string() })),
})

const QuizContentSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    explanation: z.string(),
  })),
})

const MindMapContentSchema = z.object({
  root: z.string(),
  children: z.array(z.any()),
  image_url: z.string().nullable(),
})

export const StudyToolSchema = z.object({
  id: z.string().uuid(),
  note_id: z.string().uuid(),
  type: z.enum(['flashcard', 'quiz', 'mindmap']),
  content: z.union([FlashcardContentSchema, QuizContentSchema, MindMapContentSchema]),
  image_url: z.string().nullable(),
  status: z.enum(['pending', 'completed', 'failed']),
  created_at: z.string(),
})
```

### types/index.ts
```ts
import { z } from 'zod'
import { UserSchema } from '@/lib/schemas/user.schema'
import { NoteSchema } from '@/lib/schemas/note.schema'
import { FolderSchema } from '@/lib/schemas/folder.schema'
import { TagSchema } from '@/lib/schemas/tag.schema'
import { StudyToolSchema } from '@/lib/schemas/studyTool.schema'
import { AttachmentSchema } from '@/lib/schemas/attachment.schema'

export type User = z.infer<typeof UserSchema>
export type Note = z.infer<typeof NoteSchema>
export type Folder = z.infer<typeof FolderSchema>
export type Tag = z.infer<typeof TagSchema>
export type StudyTool = z.infer<typeof StudyToolSchema>
export type Attachment = z.infer<typeof AttachmentSchema>
```

---

## 8. Editor (Tiptap)

### Editor.tsx
```tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { NoteLink } from './extensions/NoteLink'
import { useAutoSave } from './hooks/useAutoSave'
import { useRealtimeSync } from './hooks/useRealtimeSync'
import type { Note } from '@/types'

interface EditorProps {
  note: Note
}

export function Editor({ note }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      NoteLink.configure({ noteId: note.id }),
    ],
    content: note.content ?? '',
    editorProps: {
      attributes: { class: 'prose max-w-none focus:outline-none min-h-screen p-6' },
    },
  })

  useAutoSave(editor, note.id)
  useRealtimeSync(editor, note.id)

  return <EditorContent editor={editor} />
}
```

### hooks/useAutoSave.ts
```ts
'use client'

import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { updateNote } from '@/actions/notes'

export function useAutoSave(editor: Editor | null, noteId: string) {
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!editor) return

    const handler = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        const markdown = editor.storage.markdown?.getMarkdown?.() ?? editor.getText()
        await updateNote(noteId, { content: markdown })
      }, 1500) // 1.5 second debounce
    }

    editor.on('update', handler)
    return () => {
      editor.off('update', handler)
      clearTimeout(timerRef.current)
    }
  }, [editor, noteId])
}
```

### hooks/useRealtimeSync.ts
```ts
'use client'

import { useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { getEcho } from '@/lib/echo'
import { getNote } from '@/actions/notes'

export function useRealtimeSync(editor: Editor | null, noteId: string) {
  useEffect(() => {
    if (!editor) return
    const echo = getEcho()
    const channel = echo.private(`user.${getUserId()}`)

    channel.listen('.note.updated', async (data: { note_id: string }) => {
      if (data.note_id !== noteId) return
      // Re-fetch and update editor content silently (no cursor jump)
      const note = await getNote(noteId)
      if (note.content && note.content !== editor.getText()) {
        editor.commands.setContent(note.content, false) // false = no history entry
      }
    })

    return () => channel.stopListening('.note.updated')
  }, [editor, noteId])
}
```

### extensions/NoteLink.ts — custom [[note]] extension
```ts
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

export const NoteLink = Node.create({
  name: 'noteLink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      id:    { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-note-link]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-note-link': '' })]
  },

  // Input rule: typing [[text]] triggers autocomplete
  addInputRules() {
    return [
      // Handled externally via onUpdate + regex check
    ]
  },
})
```

---

## 9. AI Pipeline

The AI pipeline runs entirely as a **Server Action** in `actions/ai.ts`. No API routes needed.

### Flow
```
1. User clicks "Generate" → picks type → client calls generateStudyTool()
2. Server Action: mark generation as 'pending' via Laravel API
3. Server Action: fetch note content from Laravel
4. Server Action: call LLM via Vercel AI SDK
5. Server Action: parse + validate JSON response
6. Server Action: POST result to Laravel → Laravel saves + broadcasts studytool.ready
7. Client receives studytool.ready via Reverb → refreshes generation list
```

### actions/ai.ts
```ts
'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'  // or @ai-sdk/anthropic
import { api } from '@/lib/api'
import { StudyToolSchema } from '@/lib/schemas/studyTool.schema'
import { z } from 'zod'

const PROMPTS = {
  flashcard: (content: string) => `
You are a study assistant. Given the following Markdown note, generate 6-10 flashcard Q&A pairs.
Return ONLY valid JSON with no markdown fences:
{ "cards": [{ "question": "...", "answer": "..." }] }

Note:
${content}`,

  quiz: (content: string) => `
You are a study assistant. Generate 5-8 multiple choice questions from this note.
Return ONLY valid JSON with no markdown fences:
{ "questions": [{ "question": "...", "options": ["...","...","...","..."], "correct_index": 0, "explanation": "..." }] }

Note:
${content}`,

  mindmap: (content: string) => `
You are a study assistant. Generate a hierarchical mind map from this note.
Return ONLY valid JSON with no markdown fences:
{ "root": "Main Topic", "children": [{ "label": "...", "children": [] }] }

Note:
${content}`,
}

export async function generateStudyTool(
  noteId: string,
  type: 'flashcard' | 'quiz' | 'mindmap',
) {
  // 1. Create pending record
  const pending = await api.post(`/notes/${noteId}/study-tools`, {
    type,
    content: {},
    status: 'pending',
  })

  try {
    // 2. Fetch note content
    const note = await api.get<{ content: string }>(`/notes/${noteId}`)
    if (!note.content) throw new Error('Note has no content')

    // 3. Call LLM
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: PROMPTS[type](note.content),
    })

    // 4. Parse + validate JSON
    const content = JSON.parse(text)

    // 5. Save to Laravel (triggers studytool.ready broadcast)
    const result = await api.patch(`/study-tools/${pending.id}/status`, {
      status: 'completed',
      content,
    })

    return StudyToolSchema.parse(result)

  } catch (err) {
    // Mark as failed
    await api.patch(`/study-tools/${pending.id}/status`, { status: 'failed' })
    throw err
  }
}
```

---

## 10. Real-time Client (Reverb)

### lib/echo.ts — singleton Echo instance
```ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echoInstance: Echo | null = null

export function getEcho(): Echo {
  if (echoInstance) return echoInstance

  // Pusher is required as peer dep for Laravel Echo WebSocket transport
  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
    forceTLS: process.env.NODE_ENV === 'production',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${getTokenFromCookie()}`,
      },
    },
  })

  return echoInstance
}

function getTokenFromCookie(): string {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('sinapsis_token='))
    ?.split('=')[1] ?? ''
}
```

### Listening for events in components
```ts
// Study tool ready — show notification + refresh list
useEffect(() => {
  const echo = getEcho()
  const channel = echo.private(`user.${userId}`)

  channel.listen('.studytool.ready', (data: {
    note_id: string
    study_tool_id: string
    type: string
    status: string
  }) => {
    if (data.note_id !== activeNoteId) return
    // Trigger re-fetch of generation list
    startTransition(() => router.refresh())
  })

  return () => channel.stopListening('.studytool.ready')
}, [activeNoteId, userId])
```

---

## 11. File Uploads (Uploadthing)

### lib/uploadthing.ts
```ts
import { createUploadthing } from 'uploadthing/next'

const f = createUploadthing()

export const uploadRouter = {
  noteImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const token = req.cookies.get('sinapsis_token')?.value
      if (!token) throw new Error('Unauthorized')
      return { token }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name }
    }),

  noteAttachment: f({ blob: { maxFileSize: '32MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const token = req.cookies.get('sinapsis_token')?.value
      if (!token) throw new Error('Unauthorized')
      return { token }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name, type: file.type, size: file.size }
    }),
}
```

### Upload + save flow in component
```ts
import { useUploadThing } from '@uploadthing/react'
import { saveAttachment } from '@/actions/attachments'

const { startUpload } = useUploadThing('noteAttachment')

async function handleFileUpload(file: File, noteId: string) {
  const uploaded = await startUpload([file])
  if (!uploaded?.[0]) return

  // Save URL to Laravel DB
  await saveAttachment(noteId, {
    file_url: uploaded[0].url,
    file_name: uploaded[0].name,
    file_type: file.type,
    file_size: file.size,
  })
}
```

---

## 12. Environment Configuration

```env
# Laravel API
NEXT_PUBLIC_API_URL=https://api.sinapsis.app

# Reverb
NEXT_PUBLIC_REVERB_APP_KEY=
NEXT_PUBLIC_REVERB_HOST=api.sinapsis.app
NEXT_PUBLIC_REVERB_PORT=8080

# Uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# AI (choose one)
OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
```

---

## 13. Coding Conventions

### File naming
| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `StudyPanel.tsx` |
| Hooks | camelCase with `use` prefix | `useAutoSave.ts` |
| Server Actions | camelCase | `actions/notes.ts` |
| Zustand stores | camelCase + Store suffix | `studyPanelStore.ts` |
| Zod schemas | camelCase + Schema suffix | `note.schema.ts` |
| Lib utilities | camelCase | `lib/api.ts` |

### Rules
- Server Components are the default — add `'use client'` only when needed
- Never call `fetch` directly in components — always use Server Actions or Server Component data fetching via `lib/api.ts`
- Never put server data in Zustand — stores are for UI state only
- All API response shapes must be parsed through a Zod schema before use
- All types are derived from Zod via `z.infer<>` — no manually written interfaces for API shapes
- Server Actions must validate inputs before calling `lib/api.ts`
- Use `revalidatePath()` in Server Actions after mutations — never manually refresh data
- The `lib/echo.ts` client is a singleton — never create more than one Echo instance
- The AI pipeline always sets status to `pending` first and `failed` on error — never leave generations in `pending` state

## IMPORTANT NOTES
This can be use as the main references, but its not strict and can be change or expanded, especially the code part. Just a reference for the structure and how things work.