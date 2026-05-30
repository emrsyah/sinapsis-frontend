'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getEcho, disconnectEcho } from '@/lib/echo'
import { noteKeys } from '@/queries/use-notes'

export function useUserChannel() {
  const { user, token } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user || !token) return

    const echo = getEcho(token)
    const channel = `App.Models.User.${user.user_id}`

    echo
      .private(channel)
      .listen('.note.created', () => {
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      })
      .listen('.note.updated', (data: { id?: string }) => {
        if (data.id) {
          queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) })
        }
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      })
      .listen('.note.deleted', () => {
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      })

    return () => {
      echo.leave(channel)
    }
  }, [user, token, queryClient])
}
