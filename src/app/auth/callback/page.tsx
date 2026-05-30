'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore, type AuthUser } from '@/stores/authStore'
import { api } from '@/lib/api'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      router.replace('/auth?error=google_failed')
      return
    }

    // Temporarily store token so api client can pick it up for the /me call
    localStorage.setItem('auth_token', token)

    api
      .get<AuthUser>('/v1/auth/me')
      .then((user) => {
        setAuth(token, user)
        router.replace('/')
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        router.replace('/auth?error=google_failed')
      })
  }, [searchParams, setAuth, router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="mx-auto h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
