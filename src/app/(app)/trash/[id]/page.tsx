'use client'

import { use } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Trash2 } from "lucide-react"
import { useNote, useRestoreNote, useForceDeleteNote } from "@/queries/use-notes"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function TrashDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: note, isLoading } = useNote(id)
  const { mutate: restore, isPending: restoring } = useRestoreNote()
  const { mutate: forceDelete, isPending: deleting } = useForceDeleteNote()

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-8">
        <Skeleton className="h-8 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
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

  const date = new Date(note.updated_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => restore(id, { onSuccess: () => router.push(`/notes/${id}`) })}
          disabled={restoring}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          {restoring ? "Restoring..." : "Restore"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => forceDelete(id, { onSuccess: () => router.push("/trash") })}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {deleting ? "Deleting..." : "Delete permanently"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{date}</p>
      <h1 className="text-2xl font-bold tracking-tight mb-4">{note.title || "Untitled"}</h1>
      {note.content && (
        <div
          className="text-sm text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      )}
    </div>
  )
}
