import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Folder, StoreFolder, UpdateFolder } from '@/types'

export const folderKeys = {
  all: ['folders'] as const,
}

export function useFolders() {
  return useQuery({
    queryKey: folderKeys.all,
    queryFn: () => api.get<Folder[]>('/v1/folders'),
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StoreFolder) => api.post<Folder>('/v1/folders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create folder')
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolder }) =>
      api.patch<Folder>(`/v1/folders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update folder')
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/v1/folders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete folder')
    },
  })
}
