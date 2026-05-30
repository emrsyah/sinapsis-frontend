import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Attachment } from '@/types'

export const attachmentKeys = {
  list: (noteId: string) => ['attachments', noteId] as const,
}

export function useAttachments(noteId: string) {
  return useQuery({
    queryKey: attachmentKeys.list(noteId),
    queryFn: () => api.get<Attachment[]>(`/v1/notes/${noteId}/attachments`),
    enabled: !!noteId,
  })
}

export function useUploadAttachment(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.upload<Attachment>(`/v1/notes/${noteId}/attachments`, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(noteId) })
      toast.success('File uploaded')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to upload file')
    },
  })
}

export function useDeleteAttachment(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => api.delete(`/v1/attachments/${attachmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(noteId) })
      toast.success('Attachment deleted')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete attachment')
    },
  })
}
