'use client'

import { useState } from "react"
import { Check, Copy, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePublishNote, useUnpublishNote } from "@/queries/use-notes"
import type { Note } from "@/types"

interface NoteShareToggleProps {
  note: Note
}

function getFrontendShareUrl(token: string): string {
  return `${window.location.origin}/shared/${token}`
}

export function NoteShareToggle({ note }: NoteShareToggleProps) {
  const [copied, setCopied] = useState(false)
  const { mutate: publish, isPending: publishing } = usePublishNote(note.id)
  const { mutate: unpublish, isPending: unpublishing } = useUnpublishNote(note.id)

  const isPending = publishing || unpublishing
  const shareUrl = note.share_token ? getFrontendShareUrl(note.share_token) : null

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleCopy() {
    if (shareUrl) copyUrl(shareUrl)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          {note.is_published
            ? <Globe className="h-3.5 w-3.5 text-green-500" />
            : <Lock className="h-3.5 w-3.5" />}
          {note.is_published ? "Published" : "Share"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">
              {note.is_published ? "Note is public" : "Share this note"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {note.is_published
                ? "Anyone with the link can view this note."
                : "Publish to generate a public shareable link."}
            </p>
          </div>

          {note.is_published && shareUrl && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-2 py-1.5">
              <span className="flex-1 truncate text-xs text-muted-foreground">{shareUrl}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {note.is_published ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => unpublish()}
                disabled={isPending}
              >
                {unpublishing ? "Unpublishing..." : "Unpublish"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => publish(undefined, {
                  onSuccess: (n) => {
                    if (n.share_token) copyUrl(getFrontendShareUrl(n.share_token))
                  },
                })}
                disabled={isPending}
              >
                {publishing ? "Publishing..." : "Publish & copy link"}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
