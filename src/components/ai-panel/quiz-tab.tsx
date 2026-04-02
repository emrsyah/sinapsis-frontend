"use client"

import * as React from "react"
import { CheckCircle2, XCircle, ChevronRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "./types"

interface QuizTabProps {
  questions: QuizQuestion[]
}

type AnswerState = "unanswered" | "correct" | "wrong"

export function QuizTab({ questions }: QuizTabProps) {
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [score, setScore] = React.useState(0)
  const [finished, setFinished] = React.useState(false)

  const question = questions[index]
  const answered = selected !== null
  const answerState: AnswerState = !answered
    ? "unanswered"
    : question.options[selected].correct
    ? "correct"
    : "wrong"

  function handleSelect(optionIndex: number) {
    if (answered) return
    setSelected(optionIndex)
    if (question.options[optionIndex].correct) {
      setScore((s) => s + 1)
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  function handleRestart() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  // Reset when questions change (note switch)
  React.useEffect(() => {
    handleRestart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions])

  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <Trophy className={cn("h-12 w-12", pct >= 70 ? "text-amber-400" : "text-muted-foreground")} />
        <div>
          <p className="text-lg font-bold">{score} / {questions.length}</p>
          <p className="text-sm text-muted-foreground">
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good effort!" : "Keep studying!"}
          </p>
        </div>
        <Progress value={pct} className="w-full" />
        <Button size="sm" onClick={handleRestart} className="mt-2">
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Question {index + 1} of {questions.length}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          Score: {score}
        </Badge>
      </div>

      <Progress value={progress} className="h-1" />

      {/* Question */}
      <p className="rounded-lg bg-muted/50 p-3 text-sm font-medium leading-relaxed">
        {question.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = option.correct

          let variant: string = "default"
          if (answered) {
            if (isCorrect) variant = "correct"
            else if (isSelected) variant = "wrong"
            else variant = "dim"
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                !answered && "hover:bg-accent hover:border-border/80 cursor-pointer",
                answered && "cursor-default",
                variant === "correct" && "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
                variant === "wrong" && "border-red-400/50 bg-red-400/10 text-red-600 dark:text-red-400",
                variant === "dim" && "opacity-40",
                !answered && "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                  !answered && "border-muted-foreground/40 text-muted-foreground",
                  variant === "correct" && "border-green-500 text-green-600",
                  variant === "wrong" && "border-red-400 text-red-500"
                )}
              >
                {answered && isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : answered && isSelected ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className={cn(
            "rounded-lg border p-3 text-xs leading-relaxed",
            answerState === "correct"
              ? "border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400"
              : "border-red-400/20 bg-red-400/5 text-red-600 dark:text-red-400"
          )}
        >
          <span className="font-semibold">
            {answerState === "correct" ? "Correct! " : "Not quite. "}
          </span>
          {question.explanation}
        </div>
      )}

      {/* Next */}
      {answered && (
        <Button size="sm" className="gap-1.5" onClick={handleNext}>
          {index + 1 >= questions.length ? "See results" : "Next question"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
