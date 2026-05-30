'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function AuthInit() {
  const init = useAuthStore((state) => state.init)
  useEffect(() => { init() }, [init])
  return null
}
