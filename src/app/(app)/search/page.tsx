"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FileText, Pin, Search } from "lucide-react"
import { useNotes } from "@/queries/use-notes"
import { Skeleton } from "@/components/ui/skeleton"

function NoteResult({ note, onClick }: {
  note: { id: string; title: string; content: string | null; updated_at: string; is_pinned: boolean }
  onClick: () => void
}) {
  const preview = note.content ? note.content.replace(/<[^>]+>/g, "").slice(0, 140) : ""
  const date = new Date(note.updated_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border/50 bg-card px-4 py-3.5 hover:bg-accent transition-colors"
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
            {note.is_pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
          </div>
          {preview && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{preview}</p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground/40">{date}</p>
        </div>
      </div>
    </button>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  const { data: notes, isLoading } = useNotes({ search: q })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-8 py-5 flex items-center gap-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <h1 className="text-sm font-semibold">
          {q ? (
            <>Results for <span className="text-primary">"{q}"</span></>
          ) : (
            "Search"
          )}
        </h1>
        {!isLoading && notes && q && (
          <span className="text-xs text-muted-foreground ml-auto">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="mx-auto max-w-2xl px-8 py-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !q ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Search className="h-10 w-10 opacity-15" />
            <p className="text-sm">Enter a query to search your notes.</p>
          </div>
        ) : notes?.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-15" />
            <p className="text-sm">No notes found for <span className="text-foreground">"{q}"</span></p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-8 py-6 space-y-2">
            {notes?.map((note) => (
              <NoteResult
                key={note.id}
                note={note}
                onClick={() => router.push(`/notes/${note.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
