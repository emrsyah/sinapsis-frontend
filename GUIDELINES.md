# Sinapsis Frontend Guidelines

Complete reference for architecture, conventions, data flow, and standard libraries.

---

## Table of Contents

1. [Stack & Libraries](#1-stack--libraries)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [API Client](#4-api-client)
5. [Data Fetching — TanStack Query](#5-data-fetching--tanstack-query)
6. [State Management](#6-state-management)
7. [Authentication & Route Guards](#7-authentication--route-guards)
8. [Forms — React Hook Form + Zod](#8-forms--react-hook-form--zod)
9. [Schemas & Types](#9-schemas--types)
10. [Components](#10-components)
11. [Error Handling & Toasts](#11-error-handling--toasts)
12. [Real-time — Laravel Echo](#12-real-time--laravel-echo)
13. [Backend Integration Reference](#13-backend-integration-reference)
14. [What to Remove / Migrate](#14-what-to-remove--migrate)
15. [Naming & Code Conventions](#15-naming--code-conventions)

---

## 1. Stack & Libraries

### Core

| Purpose | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI components | shadcn/ui + Radix UI | — |
| Icons | Lucide React | — |

### Data & State

| Purpose | Library | Install |
|---|---|---|
| Server state / data fetching | **TanStack Query v5** | `@tanstack/react-query` |
| TQ devtools | **React Query Devtools** | `@tanstack/react-query-devtools` |
| Client state | **Zustand v5** | already installed |
| Validation / types | **Zod v4** | already installed |

### Forms

| Purpose | Library | Install |
|---|---|---|
| Form management | **React Hook Form** | `react-hook-form` |
| Zod adapter | **@hookform/resolvers** | `@hookform/resolvers` |

### UX

| Purpose | Library | Install |
|---|---|---|
| Toasts / notifications | **Sonner** | `sonner` |
| Real-time | **Laravel Echo + Pusher** | `laravel-echo pusher-js` |

### Installing missing libraries

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers sonner laravel-echo pusher-js
```

---

## 2. Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── globals.css
│   ├── (app)/                  # Authenticated route group
│   │   ├── layout.tsx          # App shell (sidebar, navigation)
│   │   ├── page.tsx            # Home / dashboard
│   │   ├── notes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── study/[id]/page.tsx
│   │   └── trash/
│   ├── auth/
│   │   ├── page.tsx            # Login page
│   │   └── callback/page.tsx   # OAuth callback handler
│   └── shared/[token]/page.tsx # Public shared note
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (auto-generated, don't edit)
│   ├── [feature]/              # Feature-scoped components (co-located)
│   │   └── note-card.tsx
│   ├── auth-init.tsx           # Session hydration on mount
│   └── theme-provider.tsx
│
├── hooks/                      # Custom React hooks
│   ├── use-tiptap-editor.ts
│   └── use-mobile.ts
│
├── lib/
│   ├── api.ts                  # API client (fetch wrapper + auth header)
│   ├── echo.ts                 # Laravel Echo setup
│   ├── query-client.ts         # TanStack QueryClient singleton
│   ├── utils.ts                # cn() utility
│   └── schemas/                # Zod schemas (one file per resource)
│       ├── auth.schema.ts
│       ├── user.schema.ts
│       ├── note.schema.ts
│       ├── folder.schema.ts
│       ├── tag.schema.ts
│       ├── attachment.schema.ts
│       ├── noteLink.schema.ts
│       ├── sharing.schema.ts
│       └── studyTool.schema.ts
│
├── queries/                    # TanStack Query hooks (one file per resource)
│   ├── use-notes.ts
│   ├── use-folders.ts
│   ├── use-tags.ts
│   ├── use-attachments.ts
│   └── use-study-tools.ts
│
├── stores/                     # Zustand stores (client-only state)
│   ├── authStore.ts
│   └── uiStore.ts
│
├── types/
│   └── index.ts                # Re-exports all Zod-inferred types
│
└── middleware.ts               # Next.js middleware for auth guards
```

### Rules

- **`app/`** — only pages, layouts, and route handlers. No business logic.
- **`components/`** — React components only. Feature components go in their own subdirectory.
- **`queries/`** — all TanStack Query `useQuery` and `useMutation` hooks live here.
- **`stores/`** — only client-side UI state that does not belong on the server (auth session, sidebar open/closed, panel tabs). Do **not** put server data here.
- **`lib/schemas/`** — Zod is the single source of truth. Types are derived from schemas, never written by hand.
- **No `actions/` directory** — Server Actions add a proxy hop. All mutations go through the API client via TanStack Query mutations.

---

## 3. Environment Variables

Create a `.env.local` at the project root:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_APP_KEY=local-key
NEXT_PUBLIC_REVERB_SCHEME=http
```

**Rules:**
- Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. Do not put secrets here.
- Never call `process.env.NEXT_PUBLIC_*` directly in components — access them via `lib/config.ts` so you get a single place to add defaults and type safety.

```ts
// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api',
  reverb: {
    host: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    port: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    appKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? '',
    scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http',
  },
} as const
```

---

## 4. API Client

`lib/api.ts` is the **only** place that speaks to the Laravel backend. All fetch calls go through here.

```ts
// lib/api.ts
import { config } from './config'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, data?.message ?? res.statusText, data)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = void>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }, // no Content-Type — browser sets it with boundary
    }),
}

export { ApiError }
```

**Key rules:**
- Import `api` from `@/lib/api`, never use raw `fetch` in components.
- The `ApiError` class carries `.status` so you can branch on `401`, `403`, `422`, etc.
- For file uploads, call `api.upload()` — it omits `Content-Type` so the browser sets the `multipart/form-data` boundary correctly.

---

## 5. Data Fetching — TanStack Query

### Setup

**`lib/query-client.ts`** — singleton to avoid recreating on every render:

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 minute before background refetch
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})
```

**Root provider in `app/layout.tsx`:**

```tsx
// app/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TagProvider>
            <AuthInit />
            <ThemeProvider>{children}</ThemeProvider>
          </TagProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### Query Keys Convention

All query keys live in a central `queryKeys` object per resource file. This prevents typos and makes invalidation predictable.

```ts
// queries/use-notes.ts
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...noteKeys.lists(), filters] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
}
```

### useQuery Pattern

```ts
// queries/use-notes.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Note } from '@/types'

export function useNotes(folderId?: string) {
  return useQuery({
    queryKey: noteKeys.list({ folderId }),
    queryFn: () => {
      const params = new URLSearchParams()
      if (folderId) params.set('folder_id', folderId)
      return api.get<Note[]>(`/v1/notes?${params}`)
    },
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => api.get<Note>(`/v1/notes/${id}`),
    enabled: !!id,
  })
}
```

Usage in a component:

```tsx
'use client'

export function NoteList({ folderId }: { folderId: string }) {
  const { data: notes, isLoading, isError } = useNotes(folderId)

  if (isLoading) return <NoteListSkeleton />
  if (isError) return <p>Failed to load notes.</p>

  return (
    <ul>
      {notes?.map((note) => <NoteItem key={note.id} note={note} />)}
    </ul>
  )
}
```

### useMutation Pattern

```ts
// queries/use-notes.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { StoreNote, Note } from '@/types'

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StoreNote) => api.post<Note>('/v1/notes', data),
    onSuccess: (newNote) => {
      // Invalidate the notes list so it refetches
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success('Note created')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create note')
    },
  })
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<StoreNote>) => api.patch<Note>(`/v1/notes/${id}`, data),
    onSuccess: (updated) => {
      // Update the cache directly — no round-trip needed
      queryClient.setQueryData(noteKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update note')
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/notes/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success('Note moved to trash')
    },
  })
}
```

Usage in a component:

```tsx
'use client'

export function CreateNoteButton({ folderId }: { folderId: string }) {
  const { mutate: createNote, isPending } = useCreateNote()

  return (
    <Button
      onClick={() => createNote({ title: 'Untitled', folder_id: folderId })}
      disabled={isPending}
    >
      {isPending ? 'Creating...' : 'New Note'}
    </Button>
  )
}
```

### Query invalidation rules

| After this mutation | Invalidate these keys |
|---|---|
| Create / delete note | `noteKeys.lists()` |
| Update note | `noteKeys.detail(id)` + `noteKeys.lists()` |
| Create / delete folder | `['folders']` |
| Create / delete tag | `['tags']` |
| Attach / detach tag on note | `noteKeys.detail(noteId)` |
| Create study tool | `['study-tools', noteId]` |

---

## 6. State Management

### When to use what

| State type | Tool | Examples |
|---|---|---|
| Server data (fetched from API) | **TanStack Query** | Notes, folders, tags, user profile |
| Auth session (token + user) | **Zustand** (persisted in localStorage) | `useAuthStore` |
| UI state (ephemeral, per-session) | **Zustand** | Sidebar open/closed, active panel tab, editor word count |
| Form state | **React Hook Form** | Create note form, tag form |
| Component-local state | **useState** | Dialog open state, input value |

### Rule: never put server data in Zustand

If the data comes from the API, it belongs in TanStack Query's cache. Zustand is for things that don't need to be refetched or synchronized with a server.

**Wrong:**
```ts
// ❌ Don't do this
const noteStore = create((set) => ({
  notes: [],
  fetchNotes: async () => {
    const data = await api.get('/v1/notes')
    set({ notes: data })
  }
}))
```

**Right:**
```ts
// ✅ Let TanStack Query own server data
const { data: notes } = useNotes()
```

### Zustand store shape

```ts
// stores/uiStore.ts
import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  activeStudyTab: 'flashcard' | 'quiz' | 'mindmap'
  setSidebarOpen: (open: boolean) => void
  setActiveStudyTab: (tab: UIStore['activeStudyTab']) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeStudyTab: 'flashcard',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveStudyTab: (tab) => set({ activeStudyTab: tab }),
}))
```

---

## 7. Authentication & Route Guards

### Flow

```
User clicks "Login with Google"
    → window.location.href = http://127.0.0.1:8000/api/v1/auth/login
    → Laravel redirects to Google OAuth
    → Google redirects to Laravel callback
    → Laravel redirects to http://localhost:3000/auth/callback?token=<token>
    → /auth/callback fetches GET /api/v1/auth/me, stores token + user
    → redirect to /
```

### Next.js Middleware (route guard)

```ts
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth', '/auth/callback', '/shared']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

> **Note:** The current auth stores the token in `localStorage`. Middleware runs on the server and cannot read `localStorage`. To make middleware-based guards work, migrate token storage from `localStorage` to an **httpOnly cookie**. Update `authStore.setAuth` to also set `document.cookie = 'auth_token=...'` (or use a server action / API route to set the cookie server-side).
>
> Until cookies are used, use client-side redirect in `app/(app)/layout.tsx` as a fallback:
>
> ```tsx
> 'use client'
> const { user } = useAuthStore()
> useEffect(() => {
>   if (!user) router.replace('/auth')
> }, [user])
> ```

### Logout

```ts
// queries/use-auth.ts
export function useLogout() {
  const { logout } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post('/v1/auth/logout'),
    onSettled: () => {
      logout()                              // clear localStorage + Zustand
      queryClient.clear()                   // wipe all cached server data
      router.replace('/auth')
    },
  })
}
```

---

## 8. Forms — React Hook Form + Zod

### Pattern

The Zod schema in `lib/schemas/` drives both type inference and runtime validation. Never write a separate interface for form fields.

```ts
// lib/schemas/tag.schema.ts
export const StoreTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color').nullable().optional(),
})
```

```tsx
// components/tag-section/add-tag-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StoreTagSchema } from '@/lib/schemas/tag.schema'
import { useCreateTag } from '@/queries/use-tags'
import type { StoreTag } from '@/types'

export function AddTagForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createTag, isPending } = useCreateTag()

  const form = useForm<StoreTag>({
    resolver: zodResolver(StoreTagSchema),
    defaultValues: { name: '', color: null },
  })

  function onSubmit(data: StoreTag) {
    createTag(data, { onSuccess })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Input {...form.register('name')} placeholder="Tag name" />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Tag'}
      </Button>
    </form>
  )
}
```

### shadcn Form wrapper

When using `shadcn/ui` form components, use the `<Form>` wrapper for better accessibility:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 422 Validation errors from Laravel

Laravel returns `422` with a `errors` object keyed by field name. Map these back to the form:

```ts
onError: (error) => {
  if (error instanceof ApiError && error.status === 422) {
    const errors = (error.data as { errors: Record<string, string[]> }).errors
    Object.entries(errors).forEach(([field, messages]) => {
      form.setError(field as keyof StoreTag, { message: messages[0] })
    })
  } else {
    toast.error('Something went wrong')
  }
}
```

---

## 9. Schemas & Types

### Single source of truth

Zod schemas in `lib/schemas/` are the **only** place types are defined. Types in `types/index.ts` are derived from them via `z.infer`.

```
lib/schemas/note.schema.ts  →  NoteSchema (Zod)
                             →  types/index.ts  →  export type Note = z.infer<typeof NoteSchema>
```

Never write `interface Note { ... }` or `type Note = { ... }` by hand.

### Schema file structure (one file per resource)

```ts
// lib/schemas/note.schema.ts
import { z } from 'zod'

// Matches the API response exactly
export const NoteSchema = z.object({
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
  tags: z.array(TagSchema),
  backlinks: z.array(z.unknown()).nullable(),
  outgoing_links: z.array(z.unknown()).nullable(),
  share_url: z.string().url().nullable(),
})

// What you send to POST /api/v1/notes
export const StoreNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().nullable().optional(),
  folder_id: z.string().uuid().nullable().optional(),
})

// What you send to PATCH /api/v1/notes/:id
export const UpdateNoteSchema = StoreNoteSchema.partial()
```

### Rules

- `*Schema` — the Zod object (for runtime validation and `z.infer`)
- `Store*Schema` — the shape of a POST request body
- `Update*Schema` — the shape of a PATCH request body (often `Store*Schema.partial()`)
- Never import from `lib/schemas/` directly in components — import from `types/index.ts`

---

## 10. Components

### Folder convention

```
components/
├── ui/                   # shadcn primitives — generated, never edited manually
├── note/                 # Note-related feature components
│   ├── note-card.tsx
│   ├── note-list.tsx
│   └── note-editor.tsx
├── tag-section/          # Tag UI (already exists)
│   └── tag-section.tsx
├── ai-panel/             # Study tools panel (already exists)
└── [shared]/             # Small reusable components (not feature-specific)
    └── empty-state.tsx
```

### Rules

- One component per file.
- File name is kebab-case and matches the component name: `NoteCard` → `note-card.tsx`.
- Co-locate hooks that are only used by one component next to it: `note-card.tsx` + `use-note-card.ts`.
- A component file should not exceed ~200 lines. Split it if it does.
- `'use client'` only on components that use browser APIs, hooks, or event handlers. Keep server components (no directive) when possible.

### Loading states

Use `skeleton` components, not spinners. Every query has a loading state — design the skeleton before the data.

```tsx
export function NoteList() {
  const { data: notes, isLoading } = useNotes()

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return <>{notes?.map(...)}</>
}
```

### Empty states

Every list should handle the zero-item case:

```tsx
if (notes?.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
      <FileText className="h-8 w-8 opacity-30" />
      <p>No notes yet</p>
    </div>
  )
}
```

---

## 11. Error Handling & Toasts

### Sonner setup

Add to `app/layout.tsx`:

```tsx
import { Toaster } from 'sonner'

// Inside <body>:
<Toaster position="bottom-right" richColors />
```

### Usage

```ts
import { toast } from 'sonner'

toast.success('Note created')
toast.error('Failed to delete note')
toast.info('Saving...')
toast.promise(myAsyncFn(), {
  loading: 'Saving...',
  success: 'Saved',
  error: 'Failed to save',
})
```

### Global 401 handling

When the token expires, the API returns `401`. Intercept this globally in the API client to auto-logout:

```ts
// lib/api.ts
import { useAuthStore } from '@/stores/authStore'

// Inside the request() function, after res.ok check:
if (res.status === 401) {
  useAuthStore.getState().logout()
  window.location.href = '/auth'
}
```

### Error boundaries

Wrap route segments in an `error.tsx` file (Next.js App Router pattern):

```tsx
// app/(app)/error.tsx
'use client'

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-full items-center justify-center flex-col gap-4">
      <p className="text-muted-foreground text-sm">Something went wrong</p>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## 12. Real-time — Laravel Echo

### Setup

```ts
// lib/echo.ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { config } from './config'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echo: Echo | null = null

export function getEcho(token: string): Echo {
  if (echo) return echo

  window.Pusher = Pusher

  echo = new Echo({
    broadcaster: 'reverb',
    key: config.reverb.appKey,
    wsHost: config.reverb.host,
    wsPort: config.reverb.port,
    wssPort: config.reverb.port,
    forceTLS: config.reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${config.apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  return echo
}

export function disconnectEcho() {
  echo?.disconnect()
  echo = null
}
```

### Hook for private user channel

```ts
// hooks/use-user-channel.ts
'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getEcho } from '@/lib/echo'
import { noteKeys } from '@/queries/use-notes'

export function useUserChannel() {
  const { user, token } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user || !token) return

    const echo = getEcho(token)

    echo
      .private(`App.Models.User.${user.user_id}`)
      .listen('.note.updated', () => {
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      })

    return () => {
      echo.leave(`App.Models.User.${user.user_id}`)
    }
  }, [user, token, queryClient])
}
```

Mount this hook in the app layout:

```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }) {
  useUserChannel()
  // ...
}
```

---

## 13. Backend Integration Reference

### Base URLs

| Environment | URL |
|---|---|
| Local dev | `http://127.0.0.1:8000/api` |
| All protected routes | `/v1/*` with `Authorization: Bearer {token}` |
| OAuth callback | `GET /auth/google/callback` (no `/api/` prefix) |

### Auth header

Every authenticated request must include:

```
Authorization: Bearer {token}
Accept: application/json
```

The API client handles this automatically via `lib/api.ts`.

### Response shapes

See `lib/schemas/` — the Zod schemas match the API response exactly. When the backend changes a field, update the schema first.

### Error response shapes

| Status | Shape |
|---|---|
| `401` | `{ "message": "unauthorized" }` |
| `403` | `{ "message": "..." }` |
| `404` | `{ "message": "..." }` |
| `422` | `{ "message": "...", "errors": { "field": ["msg"] } }` |
| `500` | `{ "message": "..." }` |

---

## 14. What to Remove / Migrate

### Remove from the project

| Item | Reason | Action |
|---|---|---|
| `drizzle-orm`, `drizzle-zod`, `postgres`, `@types/pg` | All DB access goes through Laravel API | `npm uninstall drizzle-orm drizzle-zod postgres @types/pg` |
| `drizzle-kit` (devDep) | No migrations needed in frontend | `npm uninstall -D drizzle-kit` |
| `src/app/actions/` directory | Replaced by TanStack Query mutations | Delete the directory |
| `DATABASE_URL` in `.env` | No direct DB access from frontend | Remove from `.env` |
| `db:*` scripts in `package.json` | No Drizzle | Remove the scripts |

### Migrate tag state from localStorage to API

Current implementation stores tags in `localStorage` via React Context (`stores/tag-provider.tsx`). Replace with TanStack Query:

```ts
// queries/use-tags.ts
export const tagKeys = {
  all: ['tags'] as const,
}

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: () => api.get<Tag[]>('/v1/tags'),
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StoreTag) => api.post<Tag>('/v1/tags', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  })
}
```

Once done, remove `stores/tag-provider.tsx` and the `<TagProvider>` wrapper from `app/layout.tsx`.

### Replace mock data

`lib/data.ts` exports `FOLDERS`, `NOTES`, `TRASH_NOTES` — hardcoded fixtures used throughout the app layout. Replace with real API calls:

```ts
// Before (in app/(app)/layout.tsx):
const notes = NOTES.filter((n) => n.folderId === folderId)

// After:
const { data: notes } = useNotes({ folderId })
```

Remove `lib/data.ts` once all usages are replaced.

---

## 15. Naming & Code Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `note-card.tsx` |
| Hooks | `use-kebab-case.ts` | `use-notes.ts` |
| Stores | `camelCaseStore.ts` | `authStore.ts` |
| Schemas | `kebab-case.schema.ts` | `note.schema.ts` |
| Query hooks | `use-resource.ts` | `use-notes.ts` |

### Imports order

```ts
// 1. React / Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

// 3. Internal — absolute (@/) paths
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { Note } from '@/types'

// 4. Components
import { Button } from '@/components/ui/button'
import { NoteCard } from '@/components/note/note-card'
```

### TypeScript rules

- Never use `any`. Use `unknown` and narrow it.
- Always derive types from Zod schemas — no manually written interfaces for API shapes.
- Use `type` imports for type-only imports: `import type { Note } from '@/types'`.
- Functions that call the API must have an explicit return type annotation.

### Component rules

- Prefer named exports: `export function NoteCard()` not `export default`.
- `'use client'` directive only when the component uses hooks, event handlers, or browser APIs.
- Props interface is declared inline above the component, not exported unless needed elsewhere.

```tsx
// ✅
interface NoteCardProps {
  note: Note
  isActive: boolean
  onClick: () => void
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) { ... }
```

### No comments in code

Write self-documenting code. Comments are for non-obvious constraints or workarounds only — not for describing what the code does.
