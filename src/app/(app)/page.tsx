import { Clock, FileText, Star } from "lucide-react"
import { FOLDERS, NOTES } from "@/lib/data"

function NoteCard({
  note,
}: {
  note: (typeof NOTES)[number]
}) {
  const folder = FOLDERS.find((f) => f.id === note.folderId)
  return (
    <a
      href={`/notes/${note.id}`}
      className="group flex flex-col gap-2 rounded-lg border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{folder?.label}</span>
        </div>
        {note.pinned && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{note.title}</p>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed line-clamp-3">
          {note.preview}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-auto pt-1">
        <Clock className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50">{note.updatedAt}</span>
      </div>
    </a>
  )
}

export default function HomePage() {
  const pinned = NOTES.filter((n) => n.pinned)
  const recent = NOTES.slice(0, 6)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Good morning</h1>
      <p className="text-sm text-muted-foreground mb-8">
        You have {NOTES.length} notes across {FOLDERS.length} folders.
      </p>

      {pinned.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-semibold">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </section>
    </div>
  )
}
