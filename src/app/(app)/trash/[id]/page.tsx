import { redirect, notFound } from "next/navigation"
import { TRASH_NOTES } from "@/lib/data"

export default async function TrashDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const note = TRASH_NOTES.find((n) => n.id === id)
  if (!note) notFound()

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-8">
      <p className="text-xs text-muted-foreground mb-4">{note.updatedAt}</p>
      <h1 className="text-2xl font-bold tracking-tight mb-4">{note.title}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">{note.preview}</p>
    </div>
  )
}
