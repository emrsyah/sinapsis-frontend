'use client'

import { Clock, FileText, Star } from "lucide-react"
import { useNotes } from "@/queries/use-notes"
import { useFolders } from "@/queries/use-folders"
import { Skeleton } from "@/components/ui/skeleton"
import type { Note } from "@/types"

function countFolders(folders: ReturnType<typeof useFolders>['data']): number {
  if (!folders) return 0
  let count = 0
  function walk(list: typeof folders) {
    for (const f of list ?? []) { count++; walk(f.children) }
  }
  walk(folders)
  return count
}

function NoteCard({ note, folderName }: { note: Note; folderName: string }) {
  const preview = note.content?.replace(/<[^>]+>/g, "").slice(0, 120) ?? ""
  const date = new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <a
      href={`/notes/${note.id}`}
      className="group flex flex-col gap-2 rounded-lg border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{folderName}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{note.title || "Untitled"}</p>
        {preview && (
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed line-clamp-3">{preview}</p>
        )}
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${tag.color ?? '#6366f1'}20`,
                color: tag.color ?? '#6366f1',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 mt-auto pt-1">
        <Clock className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50">{date}</span>
      </div>
    </a>
  )
}

function NoteCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <Skeleton className="h-3 w-1/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-3 w-4/5 rounded" />
    </div>
  )
}

export default function HomePage() {
  const { data: notes, isLoading } = useNotes()
  const { data: folders } = useFolders()

  function getFolderName(folderId: string | null): string {
    if (!folderId || !folders) return ""
    function find(list: typeof folders): string {
      for (const f of list ?? []) {
        if (f.id === folderId) return f.name
        const found = find(f.children)
        if (found) return found
      }
      return ""
    }
    return find(folders)
  }

  const folderCount = countFolders(folders)
  const recent = notes?.slice(0, 6) ?? []

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Good morning</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {isLoading
          ? "Loading your notes..."
          : `You have ${notes?.length ?? 0} notes across ${folderCount} folders.`}
      </p>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notes yet. Create one from a folder.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((note) => (
              <NoteCard key={note.id} note={note} folderName={getFolderName(note.folder_id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
