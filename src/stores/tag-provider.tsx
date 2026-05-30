"use client"

import * as React from "react"
import { tagReducer, loadTags, saveTags, type Tag } from "@/stores/tagStore"

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------
type TagContextValue = {
  tags: Tag[]
  addTag: (name: string, color?: string) => void
  updateTag: (id: string, name: string, color?: string) => void
  deleteTag: (id: string) => void
}

const TagContext = React.createContext<TagContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider — fix hydration: mulai kosong, load localStorage di useEffect
// ---------------------------------------------------------------------------
export function TagProvider({ children }: { children: React.ReactNode }) {
  // Inisialisasi KOSONG biar SSR dan client sama → tidak hydration mismatch
  const [tags, dispatch] = React.useReducer(tagReducer, [])
  const [hydrated, setHydrated] = React.useState(false)

  // Setelah mount di client: load dari localStorage
  React.useEffect(() => {
    const saved = loadTags()
    if (saved.length > 0) {
      dispatch({ type: "HYDRATE", tags: saved })
    }
    setHydrated(true)
  }, [])

  // Simpan ke localStorage setiap perubahan (hanya setelah hydration selesai)
  React.useEffect(() => {
    if (hydrated) saveTags(tags)
  }, [tags, hydrated])

  const addTag = React.useCallback((name: string, color = "#6366f1") => {
    dispatch({ type: "ADD", name, color })
  }, [])

  const updateTag = React.useCallback((id: string, name: string, color = "#6366f1") => {
    dispatch({ type: "UPDATE", id, name, color })
  }, [])

  const deleteTag = React.useCallback((id: string) => {
    dispatch({ type: "DELETE", id })
  }, [])

  return (
    <TagContext.Provider value={{ tags, addTag, updateTag, deleteTag }}>
      {children}
    </TagContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTags() {
  const ctx = React.useContext(TagContext)
  if (!ctx) throw new Error("useTags must be used within a TagProvider")
  return ctx
}
