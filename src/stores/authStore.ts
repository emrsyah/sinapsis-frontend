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

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      setCookie('auth_token', token)
    }
    set({ token, user })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      clearCookie('auth_token')
    }
    set({ token: null, user: null })
  },
  init: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    if (token && userStr) {
      try {
        setCookie('auth_token', token)
        set({ token, user: JSON.parse(userStr) })
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        clearCookie('auth_token')
      }
    }
  },
}))
