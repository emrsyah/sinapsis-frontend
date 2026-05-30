'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const login = useAuthStore((state) => state.login)
  const router = useRouter()
  
  // State untuk nge-track lagi di mode Login (true) atau Sign Up (false)
  const [isLogin, setIsLogin] = useState(true)

  const handleGoogleAuth = () => {
    window.location.href = 'http://127.0.0.1:8000/auth/google/callback'
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-12 w-12 bg-green-500 rounded-xl mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sinapsis</h1>
          {/* Teks berubah tergantung state isLogin */}
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Welcome back, sign in to continue" : "Create your account to get started"}
          </p>
        </div>

        <Card className="border-0 shadow-none bg-transparent mt-8">
          <CardContent className="pt-0">
            <Button 
              variant="outline" 
              className="w-full border-[#2A2A2A] bg-transparent hover:bg-[#EAB308] hover:border-[#EAB308] transition-colors"
              onClick={handleGoogleAuth}
            >
              <span className="mr-2 font-bold">G</span> 
              {/* Tombol berubah sesuai state */}
              {isLogin ? "Log in with Google" : "Sign up with Google"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} // Pas diklik, mode-nya dibalik
            className="text-green-500 hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  )
}