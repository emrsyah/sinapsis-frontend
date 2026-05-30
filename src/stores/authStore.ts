import { create } from 'zustand'

interface User {
  name: string
  email: string
  avatar_url?: string
}

interface AuthStore {
  user: User | null
  login: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, // Default: belum login
  // Dummy data login, pura-puranya ini dapet dari backend
  login: () => set({ 
    user: { 
      name: 'Zibran Santosa', 
      email: 'zibran.santosa22@gmail.com',
      avatar_url: 'https://github.com/shadcn.png' // Avatar default sementara
    } 
  }),
  logout: () => set({ user: null }),
}))