"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, FileText, Pin, Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useNotes } from "@/queries/use-notes"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query.trim(), 300)

  const { data: notes, isLoading } = useNotes(
    debouncedQuery ? { search: debouncedQuery } : {},
  )

  function navigate(path: string) {
    onOpenChange(false)
    router.push(path)
  }

  function goToSearchPage() {
    const q = query.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  // Reset on close
  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const hasResults = notes && notes.length > 0
  const showResults = debouncedQuery.length > 0

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search notes">
      <CommandInput
        placeholder="Search notes..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!showResults && (
          <CommandEmpty>Type to search your notes.</CommandEmpty>
        )}

        {showResults && (
          <>
            {/* "Go to full search page" action always at top when there's a query */}
            <CommandGroup>
              <CommandItem
                value={`__search__${query}`}
                onSelect={goToSearchPage}
                className="gap-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-muted shrink-0">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <span>
                  Search for{" "}
                  <span className="font-medium text-foreground">"{query.trim()}"</span>
                </span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
              </CommandItem>
            </CommandGroup>

            {isLoading && (
              <div className="px-4 py-3 text-xs text-muted-foreground">Searching…</div>
            )}

            {!isLoading && hasResults && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Notes">
                  {notes.map((note) => {
                    const preview = note.content
                      ? note.content.replace(/<[^>]+>/g, "").slice(0, 60)
                      : ""
                    return (
                      <CommandItem
                        key={note.id}
                        value={`${note.title} ${note.id}`}
                        onSelect={() => navigate(`/notes/${note.id}`)}
                        className="gap-3 items-start"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-muted shrink-0 mt-0.5">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">
                              {note.title || "Untitled"}
                            </span>
                            {note.is_pinned && (
                              <Pin className="h-3 w-3 shrink-0 text-primary" />
                            )}
                          </div>
                          {preview && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {preview}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}

            {!isLoading && !hasResults && debouncedQuery && (
              <>
                <CommandSeparator />
                <CommandEmpty>No notes found for "{debouncedQuery}"</CommandEmpty>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
