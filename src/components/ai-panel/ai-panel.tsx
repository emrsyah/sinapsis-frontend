"use client"

import * as React from "react"
import {
  Brain,
  ChevronRight,
  Layers,
  Map,
  MessageCircle,
  Paperclip,
  Sparkles,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { FlashcardTab } from "./flashcard-tab"
import { QuizTab } from "./quiz-tab"
import { MindMapTab } from "./mindmap-tab"
import { ChatTab } from "./chat-tab"
import { NoteAttachmentsPanel } from "@/components/note/note-attachments-panel"
import { useNote } from "@/queries/use-notes"
import { useGenerateStudyTool, useStudyTool } from "@/queries/use-study-tools"
import type { FlashcardContent, MindMapContent, QuizContent } from "@/types"

interface AiPanelProps {
  noteId: string
}

const MIN_PANEL_WIDTH = 320
const DEFAULT_PANEL_WIDTH = 380
const MAX_PANEL_WIDTH = 520
const COLLAPSED_WIDTH = 44

export function AiPanel({ noteId }: AiPanelProps) {
  const [open, setOpen] = React.useState(true)
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_PANEL_WIDTH)
  const { data: note } = useNote(noteId)

  const { data: flashcardTool, isLoading: flashcardsLoading } = useStudyTool(noteId, 'flashcard')
  const { data: quizTool, isLoading: quizLoading } = useStudyTool(noteId, 'quiz')
  const { data: mindmapTool, isLoading: mindmapLoading } = useStudyTool(noteId, 'mindmap')

  const { mutate: generate, isPending: generating, variables: generateVars } = useGenerateStudyTool(noteId)

  const noteContent = note?.content ?? ''
  const noteTitle = note?.title?.trim() || "Untitled note"

  const startResize = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = panelWidth

    function handlePointerMove(moveEvent: PointerEvent) {
      const nextWidth = startWidth - (moveEvent.clientX - startX)
      setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, nextWidth)))
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }, [panelWidth])

  return (
    <div
      className={cn(
        "relative flex h-full shrink-0 flex-col border-l bg-sidebar transition-[width] duration-200 ease-out",
        !open && "overflow-hidden"
      )}
      style={{ width: open ? panelWidth : COLLAPSED_WIDTH }}
    >
      {open && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize AI panel"
          onPointerDown={startResize}
          className="absolute inset-y-0 -left-1 z-20 w-2 cursor-col-resize touch-none transition-colors hover:bg-primary/20"
        />
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute -left-3 top-5 z-30 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
        aria-label={open ? "Collapse AI panel" : "Open AI panel"}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Collapsed state */}
      {!open && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            AI Tools
          </span>
        </div>
      )}

      {/* Open state */}
      {open && (
        <>
          {/* Header */}
          <div className="px-4 pb-3 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold leading-5">AI Tools</h2>
                <p className="truncate text-[11px] text-muted-foreground">{noteTitle}</p>
              </div>
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
            <TabsList className="mx-3 my-3 grid h-10 w-auto grid-cols-5 gap-1 rounded-xl bg-muted/70 p-1">
              <TabsTrigger value="chat" className="h-8 gap-1 rounded-lg px-1 text-[10px] leading-none">
                <MessageCircle className="h-3 w-3" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="h-8 gap-1 rounded-lg px-1 text-[10px] leading-none">
                <Layers className="h-3 w-3" />
                <span>Cards</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="h-8 gap-1 rounded-lg px-1 text-[10px] leading-none">
                <Brain className="h-3 w-3" />
                <span>Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="h-8 gap-1 rounded-lg px-1 text-[10px] leading-none">
                <Map className="h-3 w-3" />
                <span>Map</span>
              </TabsTrigger>
              <TabsTrigger value="attachments" className="h-8 gap-1 rounded-lg px-1 text-[10px] leading-none">
                <Paperclip className="h-3 w-3" />
                <span>Files</span>
              </TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 border-t">
              <TabsContent value="chat" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ChatTab noteContent={noteContent} />
              </TabsContent>

              <TabsContent value="flashcards" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <FlashcardTab
                    content={flashcardTool?.content as FlashcardContent | undefined}
                    isLoading={flashcardsLoading || (generating && generateVars?.type === 'flashcard')}
                    onGenerate={() => generate({ content: noteContent, type: 'flashcard' })}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="quiz" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <QuizTab
                    content={quizTool?.content as QuizContent | undefined}
                    isLoading={quizLoading || (generating && generateVars?.type === 'quiz')}
                    onGenerate={() => generate({ content: noteContent, type: 'quiz' })}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="mindmap" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <MindMapTab
                    content={mindmapTool?.content as MindMapContent | undefined}
                    isLoading={mindmapLoading || (generating && generateVars?.type === 'mindmap')}
                    onGenerate={() => generate({ content: noteContent, type: 'mindmap' })}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="attachments" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <NoteAttachmentsPanel noteId={noteId} />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  )
}
