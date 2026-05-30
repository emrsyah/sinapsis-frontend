'use client'

import * as React from "react"
import { X, Plus } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useTags } from "@/queries/use-tags"
import { useAttachTag, useDetachTag } from "@/queries/use-notes"
import type { Tag } from "@/types"

interface NoteTagSelectorProps {
  noteId: string
  attachedTags: Tag[]
}

export function NoteTagSelector({ noteId, attachedTags }: NoteTagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const { data: allTags } = useTags()
  const { mutate: attach } = useAttachTag(noteId)
  const { mutate: detach } = useDetachTag(noteId)

  const attachedIds = new Set(attachedTags.map((t) => t.id))
  const available = allTags?.filter((t) => !attachedIds.has(t.id)) ?? []

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {attachedTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: `${tag.color ?? '#6366f1'}20`,
            color: tag.color ?? '#6366f1',
            border: `1px solid ${tag.color ?? '#6366f1'}40`,
          }}
        >
          {tag.name}
          <button
            onClick={() => detach(tag.id)}
            className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 rounded-full px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          {available.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              {allTags?.length === 0 ? "No tags yet" : "All tags attached"}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {available.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => { attach(tag.id); setOpen(false) }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color ?? '#6366f1' }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
