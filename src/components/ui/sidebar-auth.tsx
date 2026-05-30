'use client'

import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SidebarAuth() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/10"
        onClick={() => router.push('/auth')}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-white/10">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left overflow-hidden">
            <span className="text-sm font-medium leading-none mb-1 truncate w-full">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mb-2 bg-[#1C1C1C] border-[#2A2A2A]">
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="text-muted-foreground hover:text-white cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}