import { FileText } from "lucide-react"

export default function NotesPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <FileText className="h-8 w-8 opacity-30" />
        <p className="text-sm">Select a note from the list.</p>
      </div>
    </div>
  )
}
