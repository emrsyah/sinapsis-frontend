'use client'

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, ApiError } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import type { Note } from "@/types"

function useSharedNote(token: string) {
  return useQuery({
    queryKey: ['shared', token],
    queryFn: () => api.get<Note>(`/v1/shared/${token}`),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}

export default function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: note, isLoading, isError } = useSharedNote(token)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-8 py-16 space-y-4">
          <Skeleton className="h-10 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <div className="pt-4 space-y-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !note) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Note not found</p>
          <p className="text-sm text-muted-foreground">
            This note may have been unpublished or the link is invalid.
          </p>
        </div>
      </div>
    )
  }

  const date = new Date(note.updated_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })

  const content = note.content?.replace(/<[^>]+>/g, "") ?? ""

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-8 py-16">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              S
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Sinapsis</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{note.title || "Untitled"}</h1>
          <p className="text-sm text-muted-foreground">{date}</p>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color ?? '#6366f1'}20`,
                    color: tag.color ?? '#6366f1',
                    border: `1px solid ${tag.color ?? '#6366f1'}40`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="my-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  )
}
