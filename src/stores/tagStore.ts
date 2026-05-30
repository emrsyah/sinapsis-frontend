// tagStore.ts — pure logic, no "use client"

export type Tag = {
  id: string
  name: string
  color: string
  created_at: string
}

export type TagAction =
  | { type: "ADD"; name: string; color: string }
  | { type: "UPDATE"; id: string; name: string; color: string }
  | { type: "DELETE"; id: string }
  | { type: "HYDRATE"; tags: Tag[] } // load dari localStorage setelah mount

export function tagReducer(state: Tag[], action: TagAction): Tag[] {
  switch (action.type) {
    case "HYDRATE":
      return action.tags
    case "ADD":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          name: action.name.trim(),
          color: action.color,
          created_at: new Date().toISOString(),
        },
      ]
    case "UPDATE":
      return state.map((tag) =>
        tag.id === action.id
          ? { ...tag, name: action.name.trim(), color: action.color }
          : tag
      )
    case "DELETE":
      return state.filter((tag) => tag.id !== action.id)
    default:
      return state
  }
}

const STORAGE_KEY = "sinapsis-tags"

export function loadTags(): Tag[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Tag[]) : []
  } catch {
    return []
  }
}

export function saveTags(tags: Tag[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
  } catch {}
}
