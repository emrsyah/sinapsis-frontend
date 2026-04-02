import { notFound } from "next/navigation"
import { NOTES, FOLDERS } from "@/lib/data"
import { AiPanel } from "@/components/ai-panel"

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const note = NOTES.find((n) => n.id === id)
  if (!note) notFound()

  const folder = FOLDERS.find((f) => f.id === note.folderId)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Note content */}
      <div className="flex flex-1 flex-col overflow-y-auto p-8">
        <p className="text-xs text-muted-foreground mb-4">
          {folder?.label} · {note.updatedAt}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-6">{note.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{note.preview}</p>
      </div>

      {/* AI panel */}
      <AiPanel noteId={id} />
    </div>
  )
}
