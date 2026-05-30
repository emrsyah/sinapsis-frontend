'use client'

import { use, useEffect, useRef, useState, useCallback } from "react"
import { useNote, useUpdateNote } from "@/queries/use-notes"
import { AiPanel } from "@/components/ai-panel"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { NoteTagSelector } from "@/components/note/note-tag-selector"
import { NoteBacklinksPanel } from "@/components/note/note-backlinks-panel"
import { NoteShareToggle } from "@/components/note/note-share-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { useNoteChannel } from "@/hooks/use-note-channel"

type SaveStatus = "idle" | "saving" | "saved"

function SaveStatusIndicator({ status, lastSaved }: { status: SaveStatus; lastSaved: Date | null }) {
  function formatLastSaved(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 inline-block" />
        Saving…
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
        Saved
      </span>
    )
  }
  if (lastSaved) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 inline-block" />
        Last saved {formatLastSaved(lastSaved)}
      </span>
    )
  }
  return null
}

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: note, isLoading } = useNote(id)
  const { mutate: updateNote } = useUpdateNote(id)
  const { remoteUpdate } = useNoteChannel(id)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [titleValue, setTitleValue] = useState<string>("")
  const titleInitialized = useRef(false)

  useEffect(() => {
    if (note && !titleInitialized.current) {
      setTitleValue(note.title ?? "")
      titleInitialized.current = true
    }
  }, [note])

  const scheduleUpdate = useCallback((patch: { title?: string; content?: string }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus("saving")
    saveTimer.current = setTimeout(() => {
      updateNote(patch, {
        onSuccess: () => {
          setSaveStatus("saved")
          setLastSaved(new Date())
          setTimeout(() => setSaveStatus("idle"), 2000)
        },
        onError: () => setSaveStatus("idle"),
      })
    }, 1000)
  }, [updateNote])

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

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Note not found.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col min-h-0">
        {/* Note title */}
        <div className="px-8 pt-5 pb-1">
          <input
            type="text"
            value={titleValue}
            onChange={(e) => {
              setTitleValue(e.target.value)
              scheduleUpdate({ title: e.target.value })
            }}
            placeholder="Untitled"
            className="w-full bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none border-none focus:ring-0"
          />
        </div>

        {/* Meta bar: tags | save status | remote update | share */}
        <div className="flex items-center justify-between px-8 pt-1 pb-2 gap-2">
          <NoteTagSelector noteId={id} attachedTags={note.tags ?? []} />
          <div className="flex items-center gap-3">
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
            {remoteUpdate && (
              <span className="text-[11px] text-muted-foreground animate-pulse">
                Updated remotely
              </span>
            )}
            <NoteShareToggle note={note} />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <SimpleEditor
            content={note.content ?? null}
            onChange={(html) => scheduleUpdate({ content: html })}
          />
        </div>

        {/* Backlinks */}
        <div className="px-8 pb-6">
          <NoteBacklinksPanel noteId={id} />
        </div>
      </div>

      <AiPanel noteId={id} />
    </div>
  )
}
