'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getEcho } from '@/lib/echo'
import { noteKeys } from '@/queries/use-notes'
import type { Note } from '@/types'

type NoteUpdatedPayload = Partial<Note> & { id: string }

export function useNoteChannel(noteId: string) {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [remoteUpdate, setRemoteUpdate] = useState(false)

  useEffect(() => {
    if (!token || !noteId) return

    const echo = getEcho(token)
    const channel = `note.${noteId}`

    echo
      .private(channel)
      .listen('.note.updated', (data: NoteUpdatedPayload) => {
        queryClient.setQueryData<Note | undefined>(noteKeys.detail(noteId), (current) =>
          current ? { ...current, ...data } : current
        )
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
        setRemoteUpdate(true)
        setTimeout(() => setRemoteUpdate(false), 3000)
      })

    return () => {
      echo.leave(channel)
    }
  }, [token, noteId, queryClient])

  return { remoteUpdate }
}
