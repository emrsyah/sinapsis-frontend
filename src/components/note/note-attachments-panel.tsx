'use client'

import { useRef } from "react"
import { FileText, Image, Paperclip, Trash2, Upload } from "lucide-react"
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/queries/use-attachments"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import type { Attachment } from "@/types"

function formatBytes(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileIcon(fileType: string | null) {
  if (fileType?.startsWith("image/")) return <Image className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
  return <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
}

function AttachmentItem({ attachment, noteId }: { attachment: Attachment; noteId: string }) {
  const { mutate: deleteAttachment, isPending } = useDeleteAttachment(noteId)

  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors">
      {fileIcon(attachment.file_type)}
      <div className="min-w-0 flex-1">
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs font-medium hover:underline"
        >
          {attachment.file_name}
        </a>
        {attachment.file_size && (
          <p className="text-[10px] text-muted-foreground">{formatBytes(attachment.file_size)}</p>
        )}
      </div>
      <button
        onClick={() => deleteAttachment(attachment.id)}
        disabled={isPending}
        className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

interface NoteAttachmentsPanelProps {
  noteId: string
}

export function NoteAttachmentsPanel({ noteId }: NoteAttachmentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: attachments, isLoading } = useAttachments(noteId)
  const { mutate: upload, isPending: uploading } = useUploadAttachment(noteId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    upload(file)
    e.target.value = ""
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2">
        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Attachments
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-3 w-3" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-0.5 p-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))
        ) : uploading ? (
          <Skeleton className="h-8 w-full rounded-md animate-pulse" />
        ) : attachments?.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 py-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Paperclip className="h-5 w-5" />
            <span className="text-[11px]">Upload a file</span>
          </button>
        ) : (
          attachments?.map((a) => (
            <AttachmentItem key={a.id} attachment={a} noteId={noteId} />
          ))
        )}
      </div>
    </div>
  )
}
