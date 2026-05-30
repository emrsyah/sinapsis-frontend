"use client"

import * as React from "react"
import {
  Brain,
  ChevronRight,
  Layers,
  Map,
  Paperclip,
  Sparkles,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getAiContent } from "./dummy-content"
import { FlashcardTab } from "./flashcard-tab"
import { QuizTab } from "./quiz-tab"
import { MindMapTab } from "./mindmap-tab"
import { NoteAttachmentsPanel } from "@/components/note/note-attachments-panel"

interface AiPanelProps {
  noteId: string
}

export function AiPanel({ noteId }: AiPanelProps) {
  const [open, setOpen] = React.useState(true)
  const content = getAiContent(noteId)

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-l bg-sidebar transition-[width] duration-300 ease-in-out",
        open ? "w-80" : "w-10"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute -left-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
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
          <div className="flex items-center gap-2 px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="flex-1 text-sm font-semibold">AI Tools</span>
          </div>

          <Separator />

          <Tabs defaultValue="flashcards" className="flex flex-1 flex-col overflow-hidden">
            <TabsList className="mx-3 mt-2 mb-1 grid w-auto grid-cols-4 h-8">
              <TabsTrigger value="flashcards" className="gap-1 text-[11px] px-1">
                <Layers className="h-3 w-3" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-1 text-[11px] px-1">
                <Brain className="h-3 w-3" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="gap-1 text-[11px] px-1">
                <Map className="h-3 w-3" />
                Map
              </TabsTrigger>
              <TabsTrigger value="attachments" className="gap-1 text-[11px] px-1">
                <Paperclip className="h-3 w-3" />
                Files
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="flashcards" className="mt-0 focus-visible:ring-0">
                <FlashcardTab cards={content.flashcards} />
              </TabsContent>

              <TabsContent value="quiz" className="mt-0 focus-visible:ring-0">
                <QuizTab questions={content.quiz} />
              </TabsContent>

              <TabsContent value="mindmap" className="mt-0 focus-visible:ring-0">
                <MindMapTab root={content.mindmap} />
              </TabsContent>

              <TabsContent value="attachments" className="mt-0 focus-visible:ring-0">
                <NoteAttachmentsPanel noteId={noteId} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </>
      )}
    </div>
  )
}
