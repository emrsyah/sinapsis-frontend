import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Tag, StoreTag, UpdateTag } from '@/types'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create tag')
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTag }) =>
      api.patch<Tag>(`/v1/tags/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update tag')
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete tag')
    },
  })
}
