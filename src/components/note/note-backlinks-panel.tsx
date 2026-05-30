'use client'

import Link from "next/link"
import { FileText, Link2 } from "lucide-react"
import { useNoteBacklinks } from "@/queries/use-notes"
import { Skeleton } from "@/components/ui/skeleton"

interface NoteBacklinksPanelProps {
  noteId: string
}

export function NoteBacklinksPanel({ noteId }: NoteBacklinksPanelProps) {
  const { data, isLoading } = useNoteBacklinks(noteId)
  const backlinks = data?.backlinks ?? []

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </div>
    )
  }

  if (backlinks.length === 0) return null

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Backlinks ({backlinks.length})
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {backlinks.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{note.title || "Untitled"}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
