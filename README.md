# Sinapsis Frontend

Sinapsis is a study-focused note workspace. The frontend gives users a web app for signing in with Google, organizing notes into folders and tags, editing rich text notes, linking notes together, sharing public read-only notes, uploading attachments, and generating AI study tools such as flashcards, quizzes, mind maps, and chat responses.

This repository is the Next.js client for the Sinapsis Laravel backend in the sibling `../sinapsis-be` directory.

## Product Snapshot

- Google OAuth login through the Laravel API.
- Authenticated note workspace with home, folders, tags, note lists, trash, and search.
- Tiptap rich text editor with debounced autosave and remote update indicators.
- Note metadata tools: pinning, tags, backlinks, publishing, and public share links.
- Attachment upload and deletion through the Laravel API.
- AI panel for flashcards, quizzes, mind maps, and chat using OpenRouter through Next.js route handlers.
- Real-time updates with Laravel Echo, Pusher protocol support, and Laravel Reverb channels.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript 5 |
| Runtime UI | React 19 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI, SCSS for Tiptap |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| Validation and types | Zod 4 |
| Rich text | Tiptap 3 |
| AI | Vercel AI SDK with OpenRouter |
| Realtime | Laravel Echo, Pusher JS, Laravel Reverb |
| Notifications | Sonner |

## Application Map

```txt
src/
  app/
    (app)/                 Authenticated app shell, home, notes, trash, search, study routes
    auth/                  Google login and OAuth callback pages
    shared/[token]/        Public shared note view
    api/ai/*               OpenRouter-backed AI route handlers
    layout.tsx             Root providers and fonts
  components/
    ai-panel/              Flashcard, quiz, mind map, and chat UI
    note/                  Tags, sharing, backlinks, attachments
    tag-section/           Tag list and tag CRUD UI
    tiptap-*               Editor template, nodes, toolbar primitives, icons
    ui/                    shadcn/ui primitives
  hooks/
    use-user-channel.ts    User-level Reverb subscriptions
    use-note-channel.ts    Note-level Reverb subscriptions
    use-tiptap-editor.ts   Editor setup helpers
  lib/
    api.ts                 API client and auth headers
    config.ts              Environment defaults
    echo.ts                Laravel Echo singleton
    query-client.ts        TanStack Query client
    schemas/               Zod schemas for API resources
  queries/                 TanStack Query hooks and mutations
  stores/                  Zustand stores for auth and UI state
  types/                   Zod-inferred shared types
  proxy.ts                 Route guard using the auth cookie
```

## Routes

| Route | Purpose |
| --- | --- |
| `/auth` | Login screen. Starts Google OAuth through the Laravel backend. |
| `/auth/callback` | Receives the backend token, loads the current user, stores session state. |
| `/` | Authenticated home dashboard with recent notes and account greeting. |
| `/notes` | Notes list context inside the app shell. |
| `/notes/[id]` | Main note editor with AI panel, tags, share controls, and backlinks. |
| `/trash` | Trashed notes list. |
| `/trash/[id]` | Trashed note detail route. |
| `/search?q=...` | Note search results. |
| `/study/[id]` | Study tool detail route. |
| `/shared/[token]` | Public read-only published note page. |
| `/api/ai/flashcard` | Generates flashcard JSON from note content. |
| `/api/ai/quiz` | Generates quiz JSON from note content. |
| `/api/ai/mindmap` | Generates mind map JSON from note content. |
| `/api/ai/chat` | Answers chat prompts using note context. |

## Data Flow

Most app data moves through this path:

```txt
React component
  -> TanStack Query hook in src/queries/*
  -> api client in src/lib/api.ts
  -> Laravel endpoint under NEXT_PUBLIC_API_URL
  -> Zod-backed TypeScript types from src/types
```

The API client automatically adds:

- `Authorization: Bearer <token>` from `localStorage.auth_token`.
- `X-Socket-ID` from the active Echo connection so Laravel can avoid echoing some realtime events back to the same socket.
- JSON headers for normal requests and multipart-safe headers for uploads.

Auth state is stored in Zustand, mirrored to `localStorage`, and also written to an `auth_token` cookie so `src/proxy.ts` can protect authenticated routes.

## Backend Contract

The frontend expects the Laravel backend to expose `/api/v1/*` endpoints. In local development, the default base URL is:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Important backend resources used by the frontend:

| Resource | Frontend hooks |
| --- | --- |
| Auth | `useCurrentUser`, `useLogout`, `/auth/callback` |
| Notes | `useNotes`, `useNote`, `useCreateNote`, `useUpdateNote`, delete, restore, force delete, pin |
| Folders | `useFolders`, create, update, delete |
| Tags | `useTags`, create, update, delete, attach, detach |
| Links | backlinks, create note link, delete note link |
| Sharing | publish, unpublish, public shared note fetch |
| Attachments | list, upload, delete |
| Study tools | fetch by type, generate and save |

The login button currently redirects to `http://127.0.0.1:8000/api/v1/auth/login`, so the backend should run there for local onboarding unless that URL is changed in `src/app/auth/page.tsx`.

## Getting Started

### Prerequisites

- Node.js compatible with Next.js 16.
- npm.
- The sibling Laravel backend running from `../sinapsis-be`.
- Google OAuth configured in the backend if you want to test login.
- An OpenRouter API key if you want to use AI generation.

### Install

```bash
npm install
```

### Configure Environment

Create `.env.local` in `sinapsis-frontend`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_APP_KEY=your-reverb-app-key
NEXT_PUBLIC_REVERB_SCHEME=http

OPENROUTER_API_KEY=your-openrouter-key
```

Notes:

- `NEXT_PUBLIC_*` values are exposed to the browser. Do not put secrets in them.
- `OPENROUTER_API_KEY` is server-only and used by the Next.js AI route handlers.
- The Laravel backend should also have `FRONTEND_URL=http://localhost:3000` so OAuth can return to the frontend.

### Run the Backend

From the sibling backend directory:

```bash
cd ../sinapsis-be
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

If you are testing realtime events, also run Laravel Reverb and the queue worker according to the backend setup:

```bash
php artisan reverb:start
php artisan queue:listen --tries=1
```

### Run the Frontend

From this directory:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack. |
| `npm run build` | Build the production app. |
| `npm run start` | Start the production server after a build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run format` | Format TypeScript and TSX files with Prettier. |

## Feature Guide

### Authentication

`/auth` starts Google OAuth through Laravel. `/auth/callback` receives a `token` query parameter, calls `/v1/auth/me`, then stores the token and user through `useAuthStore`.

### Notes Workspace

The authenticated app shell in `src/app/(app)/layout.tsx` owns the main two-sidebar layout: global navigation, folders, tags, trash, account controls, and contextual note lists.

The note detail page in `src/app/(app)/notes/[id]/page.tsx` loads note data with `useNote`, autosaves title and editor content with `useUpdateNote`, and shows tags, backlinks, share controls, pin/delete actions, realtime status, and the AI panel.

### Rich Text Editing

The editor lives under `src/components/tiptap-templates/simple`. Tiptap-specific UI, nodes, icons, and SCSS live under the `src/components/tiptap-*` folders. Editor content is saved as HTML.

### AI Study Tools

The AI panel calls `useGenerateStudyTool` for generated study artifacts. It first calls a local Next.js route handler under `/api/ai/{type}`. That route uses OpenRouter and validates the generated object with a Zod schema. The result is then saved to Laravel through `/v1/notes/{noteId}/study-tools`.

Saved study tool types:

- `flashcard`
- `quiz`
- `mindmap`

The chat tab is separate: it calls `/api/ai/chat` and streams a response from the current note context without saving a study tool record.

### Realtime

`src/lib/echo.ts` creates a singleton Echo client. `useUserChannel` listens for note create, update, and delete events on the user channel. `useNoteChannel` listens for updates on the active note channel and updates the TanStack Query cache.

### Public Sharing

Publishing a note creates or exposes a share token from the backend. `/shared/[token]` fetches `/v1/shared/{token}` and renders a read-only note without the authenticated app shell.

## Development Conventions

- Keep API calls inside `src/lib/api.ts` and `src/queries/*`.
- Use TanStack Query for server data and cache invalidation.
- Use Zustand only for client/session/UI state.
- Keep API resource shapes in `src/lib/schemas/*` and derive app types from `src/types`.
- Use `@/` imports for source files.
- Put reusable primitives in `src/components/ui`; put feature UI in a feature folder.
- Keep secrets out of `NEXT_PUBLIC_*` variables.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Redirected back to `/auth` | Confirm `auth_token` exists in cookies/localStorage and the backend returned `/v1/auth/me`. |
| Google login does not start | Confirm the backend is running at `http://127.0.0.1:8000` or update `src/app/auth/page.tsx`. |
| API requests fail | Confirm `NEXT_PUBLIC_API_URL` includes `/api`, for example `http://127.0.0.1:8000/api`. |
| AI generation fails | Confirm `OPENROUTER_API_KEY` is set and restart the Next.js dev server. |
| Realtime does not update | Confirm Reverb settings match `.env.local`, the backend Reverb server is running, and the authenticated token is valid. |

## Related Project Docs

- `GUIDELINES.md` contains detailed architecture and integration conventions.
- `INTEGRATION_PLAN.md` records the backend integration checklist.
- `GUIDES.md` is an older frontend reference and may not match the current implementation exactly.
