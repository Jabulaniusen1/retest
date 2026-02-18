'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo on the left */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary"></div>
          <span className="font-bold text-foreground hidden sm:block">Capital City Bank</span>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard/settings')}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
