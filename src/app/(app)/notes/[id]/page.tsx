'use client'

import { notFound } from "next/navigation"
import { use, useEffect, useRef } from "react"
import { useNote, useUpdateNote } from "@/queries/use-notes"
import { AiPanel } from "@/components/ai-panel"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Skeleton } from "@/components/ui/skeleton"

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: note, isLoading, isError, error } = useNote(id)
  const { mutate: updateNote } = useUpdateNote(id)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Autosave helper — debounced 1s
  function scheduleUpdate(patch: { title?: string; content?: string }) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => updateNote(patch), 1000)
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  if (isLoading) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
          <Skeleton className="h-8 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
      </div>
    )
  }

  if (isError || !note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Note not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <SimpleEditor />
      </div>
      <AiPanel noteId={id} />
    </div>
  )
}
