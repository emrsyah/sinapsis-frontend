'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getEcho } from '@/lib/echo'
import { noteKeys } from '@/queries/use-notes'
import type { Note } from '@/types'

type NoteUpdatedPayload = Partial<Note> & { id?: string }

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
      .listen('.note.updated', (data: NoteUpdatedPayload) => {
        const noteId = data.id
        if (noteId) {
          queryClient.setQueryData<Note | undefined>(noteKeys.detail(noteId), (current) =>
            current ? { ...current, ...data, id: noteId } : current
          )
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
