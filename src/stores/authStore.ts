import { create } from 'zustand'

export interface AuthUser {
  user_id: string
  name: string
  email: string
  image: string | null
  last_opened_note_id: string | null
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
    set({ token, user })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    set({ token: null, user: null })
  },
  init: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) })
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  },
}))
