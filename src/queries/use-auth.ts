'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore, type AuthUser } from '@/stores/authStore'
import { disconnectEcho } from '@/lib/echo'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<AuthUser>('/v1/auth/me'),
    enabled: !!token,
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post('/v1/auth/logout'),
    onSettled: () => {
      disconnectEcho()
      logout()
      queryClient.clear()
      router.replace('/auth')
    },
  })
}
