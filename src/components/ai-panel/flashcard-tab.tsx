"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Flashcard } from "./types"

interface FlashcardTabProps {
  cards: Flashcard[]
}

export function FlashcardTab({ cards }: FlashcardTabProps) {
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)

  const card = cards[index]

  function prev() {
    setFlipped(false)
    setIndex((i) => (i - 1 + cards.length) % cards.length)
  }

  function next() {
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
  }

  // Reset when cards change (note switch)
  React.useEffect(() => {
    setIndex(0)
    setFlipped(false)
  }, [cards])

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {flipped ? "Answer" : "Question"}
        </Badge>
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((v) => !v)}
      >
        <div
          className={cn(
            "relative min-h-[160px] transition-transform duration-500",
            "[transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-5 text-center [backface-visibility:hidden]">
            <p className="text-sm font-medium leading-relaxed">{card.front}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-primary/5 p-5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-sm leading-relaxed text-foreground">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={() => setFlipped(false)}
        >
          <RotateCw className="h-3 w-3" />
          Reset
        </Button>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setFlipped(false) }}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-4 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}
