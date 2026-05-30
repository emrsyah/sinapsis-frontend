import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type {
  FlashcardContent,
  MindMapContent,
  QuizContent,
  StudyTool,
  StudyToolType,
} from '@/types'

export const studyToolKeys = {
  all: (noteId: string) => ['study-tools', noteId] as const,
  byType: (noteId: string, type: StudyToolType) => ['study-tools', noteId, type] as const,
}

export function useStudyTool(noteId: string, type: StudyToolType) {
  return useQuery({
    queryKey: studyToolKeys.byType(noteId, type),
    queryFn: () =>
      api.get<StudyTool[]>(`/v1/notes/${noteId}/study-tools?type=${type}`).then((res) => res[0] ?? null),
    enabled: !!noteId,
  })
}

type GeneratePayload = {
  noteId: string
  content: string
  type: StudyToolType
  options?: StudyToolGenerationOptions
}

export type StudyToolGenerationOptions = {
  amount?: number
  focus?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  answerStyle?: 'concise' | 'detailed'
  branchCount?: number
  depth?: 'overview' | 'balanced' | 'detailed'
}

async function generateAndSave(payload: GeneratePayload): Promise<StudyTool> {
  const aiResult = await fetch(`/api/ai/${payload.type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: payload.content, options: payload.options }),
  })

  if (!aiResult.ok) {
    throw new Error('AI generation failed')
  }

  const aiContent = await aiResult.json() as FlashcardContent | QuizContent | MindMapContent

  return api.post<StudyTool>(`/v1/notes/${payload.noteId}/study-tools`, {
    type: payload.type,
    content: aiContent,
    status: 'completed',
    note_id: payload.noteId,
  })
}

export function useGenerateStudyTool(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { content: string; type: StudyToolType; options?: StudyToolGenerationOptions }) =>
      generateAndSave({ ...vars, noteId }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: studyToolKeys.byType(noteId, vars.type) })
      toast.success(`${vars.type.charAt(0).toUpperCase() + vars.type.slice(1)} generated!`)
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to generate study tool')
    },
  })
}
