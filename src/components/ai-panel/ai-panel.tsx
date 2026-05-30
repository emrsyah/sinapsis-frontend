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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
import { useGenerateStudyTool, useStudyTool, type StudyToolGenerationOptions } from "@/queries/use-study-tools"
import type { FlashcardContent, MindMapContent, QuizContent, StudyToolType } from "@/types"

interface AiPanelProps {
  noteId: string
}

const MIN_PANEL_WIDTH = 320
const DEFAULT_PANEL_WIDTH = 380
const MAX_PANEL_WIDTH = 520
const COLLAPSED_WIDTH = 44

type GenerationForm = {
  amount: number
  branchCount: number
  focus: string
  difficulty: NonNullable<StudyToolGenerationOptions['difficulty']>
  answerStyle: NonNullable<StudyToolGenerationOptions['answerStyle']>
  depth: NonNullable<StudyToolGenerationOptions['depth']>
}

const DEFAULT_GENERATION_FORM: GenerationForm = {
  amount: 6,
  branchCount: 5,
  focus: "",
  difficulty: "medium",
  answerStyle: "concise",
  depth: "balanced",
}

const TOOL_LABELS: Record<StudyToolType, string> = {
  flashcard: "Flashcards",
  quiz: "Quiz",
  mindmap: "Mind map",
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

function buildGenerationOptions(type: StudyToolType, form: GenerationForm): StudyToolGenerationOptions {
  const common = form.focus.trim() ? { focus: form.focus.trim() } : {}

  if (type === "flashcard") {
    return {
      ...common,
      amount: clamp(form.amount, 3, 20),
      answerStyle: form.answerStyle,
    }
  }

  if (type === "quiz") {
    return {
      ...common,
      amount: clamp(form.amount, 3, 20),
      difficulty: form.difficulty,
    }
  }

  return {
    ...common,
    branchCount: clamp(form.branchCount, 2, 10),
    depth: form.depth,
  }
}

interface GenerationDialogProps {
  type: StudyToolType | null
  form: GenerationForm
  isGenerating: boolean
  onOpenChange: (open: boolean) => void
  onFormChange: (form: GenerationForm) => void
  onSubmit: () => void
}

function GenerationDialog({
  type,
  form,
  isGenerating,
  onOpenChange,
  onFormChange,
  onSubmit,
}: GenerationDialogProps) {
  const open = type !== null

  function update<K extends keyof GenerationForm>(key: K, value: GenerationForm[K]) {
    onFormChange({ ...form, [key]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {type ? TOOL_LABELS[type] : "study tool"}</DialogTitle>
          <DialogDescription>
            Adjust the generated result before creating it from this note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {type !== "mindmap" ? (
            <label className="grid gap-2 text-sm font-medium">
              Amount
              <Input
                type="number"
                min={3}
                max={20}
                value={form.amount}
                onChange={(event) => update("amount", clamp(Number(event.target.value), 3, 20))}
              />
            </label>
          ) : (
            <label className="grid gap-2 text-sm font-medium">
              Main branches
              <Input
                type="number"
                min={2}
                max={10}
                value={form.branchCount}
                onChange={(event) => update("branchCount", clamp(Number(event.target.value), 2, 10))}
              />
            </label>
          )}

          {type === "flashcard" && (
            <label className="grid gap-2 text-sm font-medium">
              Answer style
              <select
                value={form.answerStyle}
                onChange={(event) => update("answerStyle", event.target.value as GenerationForm["answerStyle"])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
              </select>
            </label>
          )}

          {type === "quiz" && (
            <label className="grid gap-2 text-sm font-medium">
              Difficulty
              <select
                value={form.difficulty}
                onChange={(event) => update("difficulty", event.target.value as GenerationForm["difficulty"])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          )}

          {type === "mindmap" && (
            <label className="grid gap-2 text-sm font-medium">
              Detail level
              <select
                value={form.depth}
                onChange={(event) => update("depth", event.target.value as GenerationForm["depth"])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="overview">Overview</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </label>
          )}

          <label className="grid gap-2 text-sm font-medium">
            Focus
            <textarea
              value={form.focus}
              onChange={(event) => update("focus", event.target.value)}
              placeholder="Optional: formulas, definitions, weak points, exam topics..."
              className="min-h-20 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AiPanel({ noteId }: AiPanelProps) {
  const [open, setOpen] = React.useState(true)
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_PANEL_WIDTH)
  const [generationType, setGenerationType] = React.useState<StudyToolType | null>(null)
  const [generationForm, setGenerationForm] = React.useState<GenerationForm>(DEFAULT_GENERATION_FORM)
  const { data: note } = useNote(noteId)

  const { data: flashcardTool, isLoading: flashcardsLoading } = useStudyTool(noteId, 'flashcard')
  const { data: quizTool, isLoading: quizLoading } = useStudyTool(noteId, 'quiz')
  const { data: mindmapTool, isLoading: mindmapLoading } = useStudyTool(noteId, 'mindmap')

  const { mutate: generate, isPending: generating, variables: generateVars } = useGenerateStudyTool(noteId)

  const noteContent = note?.content ?? ''
  const noteTitle = note?.title?.trim() || "Untitled note"

  function openGenerationDialog(type: StudyToolType) {
    setGenerationType(type)
  }

  function submitGeneration() {
    if (!generationType) return

    generate(
      {
        content: noteContent,
        type: generationType,
        options: buildGenerationOptions(generationType, generationForm),
      },
      {
        onSuccess: () => setGenerationType(null),
      }
    )
  }

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
                    onGenerate={() => openGenerationDialog('flashcard')}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="quiz" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <QuizTab
                    content={quizTool?.content as QuizContent | undefined}
                    isLoading={quizLoading || (generating && generateVars?.type === 'quiz')}
                    onGenerate={() => openGenerationDialog('quiz')}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="mindmap" className="mt-0 h-full min-h-0 focus-visible:ring-0">
                <ScrollArea className="h-full">
                  <MindMapTab
                    content={mindmapTool?.content as MindMapContent | undefined}
                    isLoading={mindmapLoading || (generating && generateVars?.type === 'mindmap')}
                    onGenerate={() => openGenerationDialog('mindmap')}
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

          <GenerationDialog
            type={generationType}
            form={generationForm}
            isGenerating={generating}
            onOpenChange={(isOpen) => {
              if (!isOpen) setGenerationType(null)
            }}
            onFormChange={setGenerationForm}
            onSubmit={submitGeneration}
          />
        </>
      )}
    </div>
  )
}
