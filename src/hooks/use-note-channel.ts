'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getEcho } from '@/lib/echo'
import { noteKeys } from '@/queries/use-notes'

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
      .listen('.note.updated', () => {
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) })
        setRemoteUpdate(true)
        setTimeout(() => setRemoteUpdate(false), 3000)
      })

    return () => {
      echo.leave(channel)
    }
  }, [token, noteId, queryClient])

  return { remoteUpdate }
}
