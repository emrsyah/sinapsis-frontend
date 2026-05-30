import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Note, NoteLink, StoreNote, UpdateNote } from '@/types'

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...noteKeys.lists(), filters] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
}

interface NotesFilters {
  folderId?: string
  search?: string
  trash?: boolean
}

export function useNotes(filters: NotesFilters = {}) {
  return useQuery({
    queryKey: noteKeys.list(filters as Record<string, unknown>),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters.folderId) params.set('folder_id', filters.folderId)
      if (filters.search) params.set('search', filters.search)
      if (filters.trash) params.set('trash', 'true')
      const qs = params.toString()
      return api.get<Note[]>(`/v1/notes${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => api.get<Note>(`/v1/notes/${id}`),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StoreNote) => api.post<Note>('/v1/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create note')
    },
  })
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNote) => api.patch<Note>(`/v1/notes/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(noteKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save note')
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
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete note')
    },
  })
}

export function useRestoreNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.patch(`/v1/notes/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success('Note restored')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to restore note')
    },
  })
}

export function useForceDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/notes/${id}/force`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success('Note permanently deleted')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete note permanently')
    },
  })
}

// ---------------------------------------------------------------------------
// Tag attachment
// ---------------------------------------------------------------------------

export function useAttachTag(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => api.post(`/v1/notes/${noteId}/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to attach tag')
    },
  })
}

export function useDetachTag(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => api.delete(`/v1/notes/${noteId}/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to detach tag')
    },
  })
}

// ---------------------------------------------------------------------------
// Backlinks & outgoing links
// ---------------------------------------------------------------------------

export const backlinkKeys = {
  list: (noteId: string) => ['backlinks', noteId] as const,
}

export function useNoteBacklinks(noteId: string) {
  return useQuery({
    queryKey: backlinkKeys.list(noteId),
    queryFn: () => api.get<{ backlinks: Note[] }>(`/v1/notes/${noteId}/backlinks`),
    enabled: !!noteId,
  })
}

export function useCreateNoteLink(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetNoteId: string) =>
      api.post<NoteLink>(`/v1/notes/${noteId}/links`, { target_note: targetNoteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
      queryClient.invalidateQueries({ queryKey: backlinkKeys.list(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create link')
    },
  })
}

export function useDeleteNoteLink(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetId: string) => api.delete(`/v1/notes/${noteId}/links/${targetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete link')
    },
  })
}

// ---------------------------------------------------------------------------
// Publishing / sharing
// ---------------------------------------------------------------------------

export function usePublishNote(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post<Note>(`/v1/notes/${noteId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to publish note')
    },
  })
}

export function useUnpublishNote(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.delete(`/v1/notes/${noteId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to unpublish note')
    },
  })
}
