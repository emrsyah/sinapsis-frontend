export type Flashcard = {
  id: string
  front: string
  back: string
}

export type QuizOption = {
  label: string
  correct: boolean
}

export type QuizQuestion = {
  id: string
  question: string
  options: QuizOption[]
  explanation: string
}

export type MindMapNode = {
  id: string
  label: string
  children?: MindMapNode[]
}

export type AiContent = {
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  mindmap: MindMapNode
}
