# Sinapsis Frontend — Backend Integration Plan

Phase-by-phase checklist for wiring the frontend to the Laravel backend.
Complete each phase fully before moving to the next.

---

## Phase 0 — Foundation Cleanup

Get the project into a clean state before any real integration work.

**Remove unused dependencies**
- [ ] `npm uninstall drizzle-orm drizzle-zod postgres @types/pg`
- [ ] `npm uninstall -D drizzle-kit`
- [ ] Remove `DATABASE_URL` from `.env`
- [ ] Remove `db:*` scripts from `package.json`

**Delete dead code**
- [ ] Delete `src/app/actions/` directory entirely
- [ ] Clear `src/lib/api.ts` scaffold and implement the real API client (see GUIDELINES §4)
- [ ] Clear `src/lib/auth.ts` scaffold (logic lives in `authStore` and the callback page)
- [ ] Clear `src/lib/uploadthing.ts` scaffold (not used — attachments go through Laravel)

**Install missing libraries**
- [ ] `npm install @tanstack/react-query @tanstack/react-query-devtools`
- [ ] `npm install react-hook-form @hookform/resolvers`
- [ ] `npm install sonner`
- [ ] `npm install laravel-echo pusher-js`

**Wire up providers**
- [ ] Create `src/lib/query-client.ts` (QueryClient singleton)
- [ ] Create `src/lib/config.ts` (typed env vars)
- [ ] Add `<QueryClientProvider>` to `src/app/layout.tsx`
- [ ] Add `<Toaster>` (Sonner) to `src/app/layout.tsx`
- [ ] Add `<ReactQueryDevtools>` to `src/app/layout.tsx` (dev only)

**Create folder structure**
- [ ] Create `src/queries/` directory (one file per resource)
- [ ] Create `src/middleware.ts` (stub — real auth guard added in Phase 1)

---

## Phase 1 — Authentication

Make login, session persistence, and route protection fully functional.

**Login flow**
- [ ] Verify `src/app/auth/page.tsx` redirects to `GET /api/v1/auth/login`
- [ ] Verify `src/app/auth/callback/page.tsx` calls `GET /api/v1/auth/me` and stores token + user via `setAuth`
- [ ] Handle `?error=google_failed` on `/auth` page (show error message to user)

**Token storage**
- [ ] Migrate token from `localStorage` to a cookie so Next.js middleware can read it
  - In `authStore.setAuth`: also write `document.cookie = 'auth_token=<token>; path=/'`
  - In `authStore.logout`: also clear the cookie

**Route guard**
- [ ] Implement `src/middleware.ts` — redirect unauthenticated users to `/auth`
  - Public paths: `/auth`, `/auth/callback`, `/shared/*`
  - Read token from cookie (`request.cookies.get('auth_token')`)

**Logout**
- [ ] Create `src/queries/use-auth.ts`
- [ ] Implement `useLogout` mutation — calls `POST /api/v1/auth/logout`, clears store + QueryClient cache, redirects to `/auth`
- [ ] Wire up logout button in `SidebarAuth` component

**User profile**
- [ ] Implement `useCurrentUser` query — `GET /api/v1/auth/me`
- [ ] Use real user data in `SidebarAuth` (already reads from `useAuthStore`)

---

## Phase 2 — Tags

Tags are a dependency of notes, so they must be working before Phase 3.
This phase also removes the localStorage tag system.

**Query hooks — `src/queries/use-tags.ts`**
- [ ] `useTags` — `GET /api/v1/tags`
- [ ] `useCreateTag` — `POST /api/v1/tags`
- [ ] `useUpdateTag` — `PATCH /api/v1/tags/{tag}`
- [ ] `useDeleteTag` — `DELETE /api/v1/tags/{tag}`

**Wire up `tag-section` component**
- [ ] Replace `useTags()` context hook with the new TanStack Query hook
- [ ] Replace `addTag` / `updateTag` / `deleteTag` calls with mutations
- [ ] Add loading skeleton while tags fetch
- [ ] Add toast feedback on create / update / delete errors

**Cleanup**
- [ ] Delete `src/stores/tag-provider.tsx`
- [ ] Remove `<TagProvider>` from `src/app/layout.tsx`
- [ ] Delete `src/stores/tagStore.ts`

---

## Phase 3 — Folders

Replace mock `FOLDERS` data in the sidebar with real API data.

**Query hooks — `src/queries/use-folders.ts`**
- [ ] `useFolders` — `GET /api/v1/folders` (returns tree with nested `children`)
- [ ] `useCreateFolder` — `POST /api/v1/folders`
- [ ] `useUpdateFolder` — `PATCH /api/v1/folders/{folder}`
- [ ] `useDeleteFolder` — `DELETE /api/v1/folders/{folder}`

**Wire up sidebar**
- [ ] Replace `FOLDERS` import in `src/app/(app)/layout.tsx` with `useFolders()`
- [ ] Render nested folder tree (handle `children` recursively)
- [ ] Add skeleton while folders load
- [ ] Add "New Folder" button wired to `useCreateFolder`
- [ ] Add rename / delete actions per folder

---

## Phase 4 — Notes (Core CRUD)

Replace mock `NOTES` and `TRASH_NOTES` data with real API calls.

**Query hooks — `src/queries/use-notes.ts`**
- [ ] `useNotes(filters?)` — `GET /api/v1/notes` (supports `folder_id`, `search`, `trash`)
- [ ] `useNote(id)` — `GET /api/v1/notes/{note}`
- [ ] `useCreateNote` — `POST /api/v1/notes`
- [ ] `useUpdateNote(id)` — `PATCH /api/v1/notes/{note}`
- [ ] `useDeleteNote` — `DELETE /api/v1/notes/{note}` (soft delete)
- [ ] `useRestoreNote` — `PATCH /api/v1/notes/{id}/restore`
- [ ] `useForceDeleteNote` — `DELETE /api/v1/notes/{id}/force`

**Wire up sidebar (Sidebar 2 — note list)**
- [ ] Replace `NOTES` / `TRASH_NOTES` with `useNotes({ folderId })` / `useNotes({ trash: true })`
- [ ] Add skeleton while notes load
- [ ] Add empty state ("No notes yet")

**Wire up note editor page — `src/app/(app)/notes/[id]/page.tsx`**
- [ ] Load note content via `useNote(id)`
- [ ] Save title/content changes via `useUpdateNote` (debounced autosave)
- [ ] Show loading skeleton while note loads
- [ ] Handle 404 (note not found or not owned)

**Wire up home page — `src/app/(app)/page.tsx`**
- [ ] Replace hardcoded `NOTES` / `FOLDERS` with real queries
- [ ] Show pinned notes and recent notes from API

**Wire up trash page — `src/app/(app)/trash/`**
- [ ] Load trashed notes via `useNotes({ trash: true })`
- [ ] Wire "Restore" button to `useRestoreNote`
- [ ] Wire "Delete Permanently" button to `useForceDeleteNote`

**Cleanup**
- [ ] Delete `src/lib/data.ts` once all usages are removed

---

## Phase 5 — Note Tags & Links

Attach tags to notes and manage wiki-style backlinks.

**Tag attachment on a note**
- [ ] `useAttachTag(noteId, tagId)` — `POST /api/v1/notes/{note}/tags/{tag}`
- [ ] `useDetachTag(noteId, tagId)` — `DELETE /api/v1/notes/{note}/tags/{tag}`
- [ ] Wire tag selector in the note editor sidebar/panel
- [ ] Show attached tags on note cards in the note list

**Note links (backlinks)**
- [ ] `useNoteBacklinks(noteId)` — `GET /api/v1/notes/{note}/backlinks`
- [ ] `useCreateNoteLink(noteId)` — `POST /api/v1/notes/{note}/links`
- [ ] `useDeleteNoteLink(noteId, targetId)` — `DELETE /api/v1/notes/{note}/links/{target}`
- [ ] Display backlinks panel in the note editor view

---

## Phase 6 — Note Sharing

Allow users to publish notes and share them publicly.

**Query hooks (add to `use-notes.ts`)**
- [ ] `usePublishNote(noteId)` — `POST /api/v1/notes/{note}/publish`
- [ ] `useUnpublishNote(noteId)` — `DELETE /api/v1/notes/{note}/publish`

**Wire up UI**
- [ ] Add "Share" toggle in note editor toolbar/panel
- [ ] Show shareable link (`share_url`) when note is published
- [ ] Add copy-to-clipboard button for the share URL

**Public shared note page — `src/app/shared/[token]/page.tsx`**
- [ ] Fetch note via `GET /api/v1/shared/{token}` (no auth required)
- [ ] Render note content as read-only
- [ ] Handle 404 (not published or invalid token)

---

## Phase 7 — Attachments

Wire up file upload and deletion for note attachments.

**Query hooks — `src/queries/use-attachments.ts`**
- [ ] `useAttachments(noteId)` — `GET /api/v1/notes/{note}/attachments`
- [ ] `useUploadAttachment(noteId)` — `POST /api/v1/notes/{note}/attachments` (multipart/form-data, use `api.upload()`)
- [ ] `useDeleteAttachment(attachmentId)` — `DELETE /api/v1/attachments/{attachment}`

**Wire up UI**
- [ ] Connect image upload button in Tiptap toolbar to `useUploadAttachment`
- [ ] Display uploaded attachments list in note sidebar
- [ ] Add delete button per attachment

---

## Phase 8 — Study Tools

Wire up AI-generated flashcards, quizzes, and mind maps.

**Query hooks — `src/queries/use-study-tools.ts`**
- [ ] `useStudyTools(noteId, type)` — `GET /api/v1/notes/{id}/study-tools?type={type}`
- [ ] `useStudyTool(noteId, type)` — `GET /api/v1/study-tools/{id}?note_id={noteId}&type={type}`
- [ ] `useCreateStudyTool(noteId)` — `POST /api/v1/notes/{id}/study-tools`

**Wire up AI panel**
- [ ] Replace dummy content in `ai-panel/` with real data from queries
- [ ] Add loading state while study tool generates (`status: 'pending'`)
- [ ] Add error state for `status: 'failed'`
- [ ] Render content for `status: 'completed'`
- [ ] Wire "Generate" button to `useCreateStudyTool`

> **Note:** The current backend quirk — `POST /notes/{id}/study-tools` uses `note_id` from the request body, not the route `{id}`. Pass `note_id` explicitly in the mutation body.

---

## Phase 9 — Real-time (Laravel Echo / Reverb)

Add live updates so changes reflect immediately without manual refresh.

**Setup**
- [ ] Implement `src/lib/echo.ts` (see GUIDELINES §12)
- [ ] Create `src/hooks/use-user-channel.ts`
- [ ] Mount `useUserChannel()` in `src/app/(app)/layout.tsx`

**Events to handle on `App.Models.User.{user_id}` channel**
- [ ] Note created → invalidate `noteKeys.lists()`
- [ ] Note updated → invalidate `noteKeys.detail(id)`
- [ ] Note deleted → invalidate `noteKeys.lists()`

**Note collaboration channel `note.{noteId}`**
- [ ] Create `src/hooks/use-note-channel.ts`
- [ ] Mount on note editor page
- [ ] Handle remote content updates (show indicator or merge)

---

## Completion Checklist

| Phase | Description | Done |
|---|---|---|
| 0 | Foundation cleanup | ☐ |
| 1 | Authentication | ☐ |
| 2 | Tags | ☐ |
| 3 | Folders | ☐ |
| 4 | Notes CRUD | ☐ |
| 5 | Note tags & links | ☐ |
| 6 | Note sharing | ☐ |
| 7 | Attachments | ☐ |
| 8 | Study tools | ☐ |
| 9 | Real-time | ☐ |
