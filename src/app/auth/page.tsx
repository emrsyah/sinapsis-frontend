'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleGoogleAuth = () => {
    window.location.href = 'http://127.0.0.1:8000/api/v1/auth/login'
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-12 w-12 bg-green-500 rounded-xl mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sinapsis</h1>
          <p className="text-sm text-muted-foreground">Welcome back, sign in to continue</p>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Google sign-in failed. Please try again.
          </p>
        )}

        <Card className="border-0 shadow-none bg-transparent mt-8">
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full border-[#2A2A2A] bg-transparent hover:bg-[#EAB308] hover:border-[#EAB308] transition-colors"
              onClick={handleGoogleAuth}
            >
              <span className="mr-2 font-bold">G</span>
              Log in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
