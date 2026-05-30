"use client"

import * as React from "react"
import { Loader2, MessageCircle, RotateCcw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatTabProps {
  noteContent: string
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ChatTab({ noteContent }: ChatTabProps) {
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMessages([])
    setInput("")
    setError(null)
  }, [noteContent])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [messages, isLoading])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const question = input.trim()
    if (!question || isLoading) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: createId(), role: "user", content: question },
    ]
    const assistantId = createId()

    setInput("")
    setError(null)
    setIsLoading(true)
    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Failed to get an AI response")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + chunk }
              : message
          )
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get an AI response")
      setMessages((current) => current.filter((message) => message.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }

  const suggestions = [
    "Summarize this note",
    "What should I review?",
    "Make practice questions",
  ]

  return (
    <div className="flex h-full min-h-0 flex-col bg-background/30">
      {messages.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Unsaved chat for this note</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setMessages([])
              setError(null)
            }}
            title="Reset chat"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col justify-center gap-5">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ask about this note</p>
                <p className="mt-1 max-w-[26rem] text-xs leading-relaxed text-muted-foreground">
                  Get explanations, summaries, and review prompts without saving the chat.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-lg border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[88%] flex-col gap-1",
                  message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <span className="px-1 text-[10px] font-medium uppercase text-muted-foreground">
                  {message.role === "user" ? "You" : "AI"}
                </span>
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-card-foreground"
                  )}
                >
                  {message.content || (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t bg-sidebar/80 p-3 pr-16">
        {error && (
          <p className="mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="h-9 min-w-0 flex-1 rounded-lg bg-background text-xs"
          />
          <Button type="submit" size="icon-lg" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
